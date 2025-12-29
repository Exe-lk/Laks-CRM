import { supabase } from "@/lib/supabaseclient";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { cancelAutoCancellation } from '@/lib/autoCancelManager';
import { sendNotificationToUser } from '@/lib/fcmService';
import { NotificationType } from '@/types/notifications';


const prisma = new PrismaClient();

export default async function handler(req:NextApiRequest, res:NextApiResponse){
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({error:"Authorization headers are missing"})
        }
        const token = authHeader.split(" ")[1]
        const { data : {user}, error:userError} = await supabase.auth.getUser(token)

        if(userError || !user){
            return res.status(401).json({error: "Unauthorized: Invalid Token"})
        }
        const { request_id, locum_id, message} = req.body;

        if(!request_id || !locum_id){
            return res.status(400).json({ error: "Missing required fields"})
        }

        // Check if locum has payment cards
        const locumCustomer = await prisma.locumStripeCustomer.findUnique({
            where: { locumId: locum_id }
        });

        if (!locumCustomer) {
            return res.status(400).json({ 
                error: "Payment card required. Please add a payment card before applying for appointments." 
            });
        }

        // Check if locum has payment methods
        const SUPABASE_CUSTOMER_FUNCTION_URL = process.env.SUPABASE_CUSTOMER_FUNCTION_URL;
        const CUSTOMER_FUNCTION_SECRET = process.env.CUSTOMER_FUNCTION_SECRET;

        if (SUPABASE_CUSTOMER_FUNCTION_URL && CUSTOMER_FUNCTION_SECRET) {
            try {
                const resp = await fetch(SUPABASE_CUSTOMER_FUNCTION_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${CUSTOMER_FUNCTION_SECRET}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        action: "list_payment_methods",
                        customer_id: locumCustomer.stripeCustomerId
                    })
                });

                const json = await resp.json().catch(() => ({}));
                
                if (json.success) {
                    const paymentMethods = json.payment_methods || [];
                    if (paymentMethods.length === 0) {
                        return res.status(400).json({ 
                            error: "Payment card required. Please add a payment card before applying for appointments." 
                        });
                    }
                }
            } catch (error) {
                console.error("Error checking payment methods:", error);
                // Continue with the request if we can't check payment methods
                // The frontend check should catch this anyway
            }
        }

        const result = await prisma.$transaction(async (tx) =>{
            const request = await tx.appointmentRequest.findUnique({
                where:{request_id}
            });
            if(!request || request.status !== "PENDING"){
                throw new Error("Job No longer available")
            }

            const existingApplication = await tx.appointmentResponse.findUnique({
                where:{
                    request_locum_unique:{
                        request_id,
                        locum_id
                    }
                }
            });

            if(existingApplication){
                throw new Error("You have already applied for this job")
            }

            const conflictingBooking = await tx.booking.findFirst({
                where:{
                    locum_id,
                    booking_date:request.request_date,
                    status:"CONFIRMED",
                    AND: [
                        {
                            booking_start_time: {
                                lt: request.request_end_time
                            }
                        },
                        {
                            booking_end_time: {
                                gt: request.request_start_time
                            }
                        }
                    ]
                },
                select: {
                    booking_start_time: true,
                    booking_end_time: true,
                    booking_date: true
                }
            });

            if(conflictingBooking){
                throw new Error(`You have another booking on this date inside this timeframe (${conflictingBooking.booking_start_time} - ${conflictingBooking.booking_end_time})`);
            }

            const application = await tx.appointmentResponse.create({
                data:{
                    request_id,
                    locum_id,
                    status:"ACCEPTED",
                },
                include:{
                    locumProfile:{
                        select:{
                            fullName:true,
                            location:true,
                            contactNumber:true,
                            emailAddress:true,
                            specialties:true
                        }
                    }
                }
            });

            cancelAutoCancellation(request_id);
            
            return application
        });

        // Notify practice about the application (outside transaction to avoid blocking)
        const practice = await prisma.appointmentRequest.findUnique({
          where: { request_id },
          select: { practice_id: true },
        });

        if (practice) {
          console.log(`🔔 [Apply] Notifying practice ${practice.practice_id} about new application`);
          sendNotificationToUser(practice.practice_id, 'practice', {
            title: 'New Application Received',
            body: `${result.locumProfile.fullName} applied for your appointment`,
            data: {
              type: NotificationType.APPLICATION_RECEIVED,
              userType: 'practice',
              request_id,
              locum_id,
              url: '/practiceUser/SelectNurses',
            },
          }).catch((err) => {
            console.error('❌ [Apply] Notification error:', err);
          });
        } else {
          console.error('❌ [Apply] Practice not found for request_id:', request_id);
        }

        res.status(201).json({
            success:true,
            data:result,
            message:"Applied to the Booking successfully. Practice User will be notified"
        });
    } catch (error) {
        console.error("Apply error:", error);
        if(error instanceof Error){
            console.error("Error message:", error.message);
            return res.status(400).json({error:error.message})
        }
        console.error("Unknown error type:", error);
        res.status(500).json({error:"Failed to apply"})
    } finally {
        await prisma.$disconnect();
    }
}
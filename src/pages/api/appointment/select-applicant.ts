import { supabase } from "@/lib/supabaseclient";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { cancelAutoCancellation } from '@/lib/autoCancelManager';

const prisma = new PrismaClient()

function calculateExpiryTime(createdAt: Date, requestDate: Date, requestStartTime: string): Date {
  // Parse start time and combine with request date to get full appointment datetime
  const [hours, minutes] = requestStartTime.split(':').map(Number);
  const appointmentDateTime = new Date(requestDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  // Calculate time difference between creation and appointment start
  const timeDiff = appointmentDateTime.getTime() - createdAt.getTime();
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);

  let responseTimeMs: number;
  
  if (hoursUntilAppointment < 24) {
    // Below 24 hours: 15 minutes timeout
    responseTimeMs = 15 * 60 * 1000;
  } else if (hoursUntilAppointment >= 24 && hoursUntilAppointment <= 48) {
    // 24-48 hours: 1 hour timeout
    responseTimeMs = 60 * 60 * 1000;
  } else {
    // More than 48 hours: 2 hours timeout
    responseTimeMs = 2 * 60 * 60 * 1000;
  }
  
  return new Date(createdAt.getTime() + responseTimeMs);
}

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        const { request_id, locum_id } = req.body;

        if (!request_id || !locum_id) {
             return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await prisma.$transaction(async(tx) =>{
            console.log(`Starting transaction for request_id: ${request_id}, locum_id: ${locum_id}`);
            const request = await tx.appointmentRequest.findUnique({
                where:{ request_id}
            });
            console.log(`Found request: ${request?.request_id}, status: ${request?.status}`);
            if(!request || request.status !== "PENDING"){
                throw new Error("Job No longer available for selection")
            }

            const application = await tx.appointmentResponse.findUnique({
                where:{
                    request_locum_unique:{
                        request_id,
                        locum_id
                    }
                }
            });
            console.log(`Found application: ${application?.response_id}, status: ${application?.status}`);
            if(!application || application.status !== 'ACCEPTED'){
                throw new Error("Locum has not applied for this job");
            }

            // Check if this locum has been previously rejected for this request
            const previousRejection = await tx.appointmentConfirmation.findFirst({
                where: {
                    request_id,
                    chosen_locum_id: locum_id,
                    status: "LOCUM_REJECTED"
                }
            });
            if(previousRejection){
                throw new Error("This locum has been previously rejected for this appointment and cannot be selected again");
            }

            const existingConfirmation = await tx.appointmentConfirmation.findFirst({
                where:{
                    request_id,
                    status:"PRACTICE_CONFIRMED"
                }
            });

            if(existingConfirmation){
                throw new Error("Another locum is already selected for this appointment")
            }

            const confirmationCount = await tx.appointmentConfirmation.count({
                where:{request_id}
            });

            const expiryTime = calculateExpiryTime(request.createdAt, request.request_date, request.request_start_time);
            console.log(`Calculated expiry time: ${expiryTime}`);

            // Update the selected locum's response status to PRACTICE_CONFIRMED
            console.log(`About to update appointment response for request_id: ${request_id}, locum_id: ${locum_id}`);
            await tx.appointmentResponse.update({
                where: {
                    request_locum_unique: {
                        request_id,
                        locum_id
                    }
                },
                data: {
                    status: "PRACTICE_CONFIRMED"
                }
            });

            const confirmation = await tx.appointmentConfirmation.create({
                data:{
                    request_id,
                    chosen_locum_id:locum_id,
                    confirmation_number:confirmationCount + 1,
                    expires_at: expiryTime,
                    status: "PRACTICE_CONFIRMED"
                },
                include:{
                    chosenLocum:{
                        select:{
                            fullName:true,
                            contactNumber:true,
                            emailAddress:true
                        }
                    },
                    request:{
                        select:{
                            request_date:true,
                            request_start_time:true,
                            request_end_time:true,
                            location:true,
                            practice:{
                                select:{
                                    name:true
                                }
                            }
                        }
                    }
                }
            });

            // Cancel auto-cancellation since a locum has been selected
            cancelAutoCancellation(request_id);

            console.log(`Transaction completed successfully for request_id: ${request_id}`);
            return confirmation;
        }, {
            maxWait: 10000, // 10 seconds
            timeout: 15000, // 15 seconds
        });

        res.status(201).json({
            success:true,
            data:result,
            message: "Locum Selected Successfully, They have been notified"
        })
        
    } catch (error) {
        console.error("Select applicant error:", error);
        if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to select applicant" });
    }
}
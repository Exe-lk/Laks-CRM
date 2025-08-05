import { supabase } from "@/lib/supabaseclient";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req:NextApiRequest, res:NextApiResponse){
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({error:"Authorization headers are missing"})
        }
        const token = authHeader.split("")[1]
        const { data : {user}, error:userError} = await supabase.auth.getUser(token)

        if(userError || !user){
            return res.status(401).json({error: "Unauthorized: Invalid Token"})
        }
        const { request_id, locum_id, message} = req.body;

        if(!request_id || !locum_id){
            return res.status(400).json({ error: "Missing required fields"})
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
                    OR: [
                        {
                            AND:[
                                {booking_start_time:{lte:request.request_start_time}},
                                {booking_end_time:{lte:request.request_start_time}}
                            ]
                        },
                        {
                            AND:[
                                {booking_start_time:{lte: request.request_end_time}},
                                {booking_end_time:{lte:request.request_end_time}}
                            ]
                        }
                    ]
                }
            });

            if(conflictingBooking){
                throw new Error("You have a conflicting booking at this time");
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
            return application
        });

        res.status(201).json({
            success:true,
            data:result,
            message:"Applied to the Booking successfully. Practice User will be notified"
        });
    } catch (error) {
        console.error("Apply error",error);
        if(error instanceof Error){
            return res.status(400).json({error:error.message})
        }
        res.status(500).json({error:"Failed to apply"})
    }
}
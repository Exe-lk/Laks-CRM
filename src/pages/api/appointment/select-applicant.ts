import { supabase } from "@/lib/supabaseclient";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient()

function calculateExpiryTime(appointmentDate: Date): Date {
  const now = new Date();
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let responseTimeMs: number;
  
  if (hoursUntilAppointment >= 24) {
    responseTimeMs = 2 * 60 * 60 * 1000; // 2 hours
  } else if (hoursUntilAppointment >= 12) {
    responseTimeMs = 15 * 60 * 1000; // 15 minutes
  } else {
    responseTimeMs = 5 * 60 * 1000; // 5 minutes
  }
  
  return new Date(now.getTime() + responseTimeMs);
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
            const request = await tx.appointmentRequest.findUnique({
                where:{ request_id}
            });
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

            const expiryTime = calculateExpiryTime(request.request_date);

            // Update the selected locum's response status to PRACTICE_CONFIRMED
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

            return confirmation;
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
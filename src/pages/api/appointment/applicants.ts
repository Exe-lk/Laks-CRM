import { supabase } from "@/lib/supabase";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSpecialityDisplayName } from "@/lib/enums";

const prisma = new PrismaClient();

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({error: "Authorization headers are missing"})
        }

        const token = authHeader.split(" ")[1]
        const {data: {user}, error: userError} = await supabase.auth.getUser(token)

        if(userError || !user){
            return res.status(401).json({error: "Unauthorized: Invalid Token"})
        }

        const { request_id } = req.query;

        if (!request_id) {
        return res.status(400).json({ error: "Request ID required" });
       }

       const request = await prisma.appointmentRequest.findUnique({
        where:{request_id:request_id as string},
        include:{
            practice:{
                select:{
                    name:true,
                    location:true,
                    address:true
                }
            },
            branch:{
                select:{
                    id:true,
                    name:true,
                    address:true,
                    location:true
                }
            }
        }
       });
       if(!request){
        return res.status(404).json({error: "Job Not found"})
       }
       const rejectedLocums = await prisma.appointmentConfirmation.findMany({
        where: {
            request_id: request_id as string,
            status: "LOCUM_REJECTED"
        },
        select: {
            chosen_locum_id: true
        }
       });

       const rejectedLocumIds = rejectedLocums.map(rl => rl.chosen_locum_id);

       const applicants = await prisma.appointmentResponse.findMany({
        where:{
            request_id:request_id as string,
            status: "ACCEPTED",
            locum_id: {
                notIn: rejectedLocumIds
            }
        },
        include:{
            locumProfile:{
                select:{
                    id:true,
                    fullName:true,
                    location:true,
                    address:true,
                    contactNumber:true,
                    emailAddress:true,
                    employeeType:true,
                    averageRating:true,
                    specialties:{
                        select:{
                            speciality:true,
                            numberOfYears:true
                        }
                    }
                }
            }
        },
        orderBy:{
            responded_at:'asc'
        }
       });

       const activeConfirmation = await prisma.appointmentConfirmation.findFirst({
        where:{
            request_id:request_id as string,
            status:"PRACTICE_CONFIRMED"
        },
        include:{
            chosenLocum:{
                select:{
                    fullName:true,
                    contactNumber:true
                }
            }
        }
       });

       // Convert specialty numbers to display names
       const applicantsWithDisplayNames = applicants.map(applicant => ({
           ...applicant,
           locumProfile: {
               ...applicant.locumProfile,
               specialties: applicant.locumProfile.specialties.map(specialty => ({
                   ...specialty,
                   speciality: getSpecialityDisplayName(specialty.speciality)
               }))
           }
       }));

       res.status(200).json({
        success:true,
        data:{
            job:request,
            applicants:applicantsWithDisplayNames,
            total_applicants:applicants.length,
            active_selection:activeConfirmation,
            can_select_applicant:request.status === "PENDING" && !activeConfirmation
        }
       })


    } catch (error) {
        console.error("Get applicants error:", error);
        res.status(500).json({ error: "Failed to get applicants" });
    }
}
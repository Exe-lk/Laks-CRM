import { supabase } from "@/lib/supabase";
import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient()

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({error:"Authorization Headers are missing"})
        }

        const token = authHeader.split("")[1];
        const {data: {user}, error:userError} = await supabase.auth.getUser(token);

        if(userError || !user){
            return res.status(401).json({error:"Unauthorizzed: Invalid Token"})
        }

        const { locum_id, page = 1, limit = 20 } = req.query;

        if(!locum_id){
            return res.status(400).json({error: "Locum ID is required"})
        }

        const availableRequests = await prisma.appointmentRequest.findMany({
            where:{
                status: 'PENDING',
                request_date:{
                    gte: new Date()
                },
                NOT:{
                  responses:{
                    some:{
                        locum_id: locum_id as string
                    }
                  }  
                }
            },
            include:{
                practice:{
                    select:{
                        id:true,
                        name:true,
                        location:true,
                        address:true
                    }
                }
            },
            orderBy:{
                request_date:'asc'
            }
        });

        const locumBookings = await prisma.booking.findMany({
            where:{
                locum_id: locum_id as string,
                status: "CONFIRMED"
            },
            select:{
                booking_date:true,
                booking_start_time:true,
                booking_end_time:true
            }
        });

        const filteredRequests = availableRequests.filter(request =>{
            const hasConflict = locumBookings.some(booking =>{
                const requestDate = request.request_date.toDateString()
                const bookingDate = booking.booking_date.toDateString()

                 if (requestDate !== bookingDate) return false;
        
                return !(request.request_end_time <= booking.booking_start_time || 
                request.request_start_time >= booking.booking_end_time);
            });
            return !hasConflict
        })
        res.status(200).json(filteredRequests);
    } catch (error) {
        console.error("Get available requests error:", error);
        res.status(500).json({ error: "Failed to get available requests" });
    }
}
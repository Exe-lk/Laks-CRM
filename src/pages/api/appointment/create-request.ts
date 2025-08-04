import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";


const primsa = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST"){
        res.setHeader("Allow", ["POST"])
        return res.status(405).json({error: `Method ${req.method} not allowed`})
    }

    if(req.method === "POST"){
        try {
            const authHeader = req.headers.authorization
            if(!authHeader){
                return res.status(401).json({error: "Authorization header missing"})
            }

            const token = authHeader.split(" ")[1];
            const { data : { user}, error: userError} = await supabase.auth.getUser(token);
            if(userError || !user){
                return res.status(401).json({error: "Unauthorized: Invalid or expired token"})
            }

            const {
                practice_id,
                request_date,
                request_start_time,
                request_end_time,
                location
            } = req.body;

            if(!practice_id || !request_date || !request_start_time || !request_end_time || !location){
                return res.status(400).json({
                    error: "Missing required fields",
                    required:["practice_id", "request_date", "request_start_time", "request_end_time", "location"]
                });
            }
            const requestDate = new Date(request_date);

            if(isNaN(requestDate.getTime())){
                return res.status(400).json({error: "Invalid request date"})
            }
            if (requestDate < new Date()) {
                return res.status(400).json({ error: "Request date must be in the future" });
              }
          
              const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
              if (!timeRegex.test(request_start_time) || !timeRegex.test(request_end_time)) {
                return res.status(400).json({ error: "Invalid time format. Use HH:MM" });
              }
          
              if (request_start_time >= request_end_time) {
                return res.status(400).json({ error: "Start time must be before end time" });
              }
          
              const practice = await prisma.practice.findUnique({
                where: { id: practice_id }
              });
          
              if (!practice) {
                return res.status(404).json({ error: "Practice not found" });
              }

            const appointmentRequest = await prisma.appointmentRequest.create({
                data:{
                    practice_id,
                    request_date: requestDate,
                    request_start_time,
                    request_end_time,
                    location,
                    status: "PENDING"
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
                }
            });

            res.status(201).json({
                success:true,
                data:appointmentRequest,
                messaage:"Appointment request created"
            })
            
        } catch (error) {
            console.error("Create appointment request error:", error);
            res.status(500).json({ 
            error: "Internal server error",
            message: "Failed to create appointment request"
            });
        }
    }
}
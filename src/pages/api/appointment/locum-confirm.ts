import { supabase } from "@/lib/supabase";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { date } from "yup";

const prisma = new PrismaClient();

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

    const { confirmation_id, locum_id, action } = req.body; // action: "CONFIRM" or "REJECT"

    if (!confirmation_id || !locum_id || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["CONFIRM", "REJECT"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be CONFIRM or REJECT" });
    }

    const result = await prisma.$transaction(async(tx) =>{
        const confirmation = await tx.appointmentConfirmation.findUnique({
            where:{confirmation_id},
            include:{
                request:true,
                chosenLocum:true
            }
        });

        if(!confirmation){
            throw new Error('Confirmation not found')
        }
        if (confirmation.chosen_locum_id !== locum_id) {
        throw new Error("You are not the selected locum for this confirmation");
        }

        if (confirmation.status !== "PRACTICE_CONFIRMED") {
            throw new Error("This confirmation is no longer valid");
        }

        if (confirmation.expires_at && new Date() > confirmation.expires_at) {
        // Auto-reject expired confirmation
        await tx.appointmentConfirmation.update({
          where: { confirmation_id },
          data: {
            status: "LOCUM_REJECTED",
            rejection_reason: "Expired - No response within time limit"
          }
        });
        throw new Error("Confirmation has expired");
      }

      if(action === "REJECT"){
         const updatedConfirmation = await tx.appointmentConfirmation.update({
          where: { confirmation_id },
          data: {
            status: "LOCUM_REJECTED",
            rejection_reason: "Rejected by locum"
          }
        });

        return { type: "REJECTED", data:updatedConfirmation}
      }

      const booking = await tx.booking.create({
        data:{
            request_id:confirmation_id.request_id,
            locum_id:locum_id,
            practice_id:confirmation.request.practice_id,
            booking_date:confirmation.request.request_date,
            booking_start_time:confirmation.request.request_start_time,
            booking_end_time:confirmation.request.request_end_time,
            location:confirmation.request.location,
            status:"CONFIRMED",
            accept_time:new Date()
        },
        include:{
            locumProfile:{
                select:{
                    fullName:true,
                    contactNumber:true
                }
            },
            practice:{
                select:{
                    name:true,
                    telephone:true
                }
            }
        }
      });

      await tx.appointmentConfirmation.update({
        where:{confirmation_id},
        data:{
            status:"LOCUM_CONFIRMED",
            locum_confirmed_at: new Date()
        }
      });

      await tx.appointmentRequest.update({
        where:{request_id:confirmation.request_id},
        data:{status:"CONFIRMED"}
      });
      return {type:"CONFIRMED", data:booking}
    });

    if(result.type === "REJECTED"){
        res.status(200).json({
            success:true,
            message:"Selection rejected, Practice can select another user",
            data:result.data
        });
    }else{
        res.status(201).json({
            success:true,
            message:"Booking confirmed successfully",
            data:result.data
        });
    }
    } catch (error) {
        console.error("Locum confirm error:", error);
        if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to process confirmation" });
    
    }
}
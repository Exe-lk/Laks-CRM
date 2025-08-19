import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";
import { scheduleAutoCancellation, isWithin24Hours } from '@/lib/autoCancelManager';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

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

    const {
      practice_id,
      request_date,
      request_start_time,
      request_end_time,
      location,
      required_role
    } = req.body;

    if (!practice_id || !request_date || !request_start_time || !request_end_time || !location || !required_role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const requestDate = new Date(request_date);
    if (requestDate < new Date()) {
      return res.status(400).json({ error: "Request date must be in the future" });
    }

    // Check if the appointment is within 24 hours
    const isUrgent = isWithin24Hours(requestDate);

    const appointmentRequest = await prisma.appointmentRequest.create({
      data: {
        practice_id,
        request_date: requestDate,
        request_start_time,
        request_end_time,
        location,
        required_role,
        status: 'PENDING'
      },
      include: {
        practice: {
          select: {
            name: true,
            location: true
          }
        }
      }
    });

    // If the appointment is within 24 hours, schedule auto-cancellation after 15 minutes
    if (isUrgent) {
      scheduleAutoCancellation(appointmentRequest.request_id);
      console.log(`Scheduled auto-cancellation for urgent appointment request: ${appointmentRequest.request_id}`);
    }

    const message = isUrgent 
      ? "Urgent job posted successfully! Locums will be notified. If no one applies within 15 minutes, the request will be automatically cancelled."
      : "Job posted successfully! Locums will be notified.";

    res.status(201).json({
      success: true,
      data: appointmentRequest,
      message,
      isUrgent
    });

  } catch (error) {
    console.error("Create appointment request error:", error);
    res.status(500).json({ error: "Failed to create appointment request" });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

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

    res.status(201).json({
      success: true,
      data: appointmentRequest,
      message: "Job posted successfully! Locums will be notified."
    });

  } catch (error) {
    console.error("Create appointment request error:", error);
    res.status(500).json({ error: "Failed to create appointment request" });
  }
}
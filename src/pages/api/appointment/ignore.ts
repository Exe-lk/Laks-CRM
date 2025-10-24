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

    const { request_id, locum_id, reason } = req.body;

    if (!request_id || !locum_id) {
      return res.status(400).json({ error: "Request ID and Locum ID are required" });
    }

    // Verify the locum exists
    const locumProfile = await prisma.locumProfile.findUnique({
      where: { id: locum_id },
      select: { id: true }
    });

    if (!locumProfile) {
      return res.status(404).json({ error: "Locum profile not found" });
    }

    // Verify the appointment request exists
    const appointmentRequest = await prisma.appointmentRequest.findUnique({
      where: { request_id },
      select: { request_id: true, status: true }
    });

    if (!appointmentRequest) {
      return res.status(404).json({ error: "Appointment request not found" });
    }

    // Check if appointment is already ignored
    const existingIgnore = await prisma.ignoredAppointment.findUnique({
      where: {
        ignored_appointment_unique: {
          request_id,
          locum_id
        }
      }
    });

    if (existingIgnore) {
      return res.status(409).json({ error: "Appointment is already ignored by this locum" });
    }

    // Create the ignored appointment record
    const ignoredAppointment = await prisma.ignoredAppointment.create({
      data: {
        request_id,
        locum_id,
        reason: reason || null
      },
      include: {
        request: {
          select: {
            request_id: true,
            location: true,
            request_date: true,
            request_start_time: true,
            request_end_time: true,
            practice: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: ignoredAppointment,
      message: "Appointment successfully ignored"
    });

  } catch (error) {
    console.error("Ignore appointment error:", error);
    res.status(500).json({ error: "Failed to ignore appointment" });
  }
}

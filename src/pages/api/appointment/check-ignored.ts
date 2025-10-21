import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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

    const { request_id, locum_id } = req.query;

    if (!request_id || !locum_id) {
      return res.status(400).json({ error: "Request ID and Locum ID are required" });
    }

    // Check if the appointment is ignored by this locum
    const ignoredAppointment = await prisma.ignoredAppointment.findUnique({
      where: {
        ignored_appointment_unique: {
          request_id: request_id as string,
          locum_id: locum_id as string
        }
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

    res.status(200).json({
      success: true,
      isIgnored: !!ignoredAppointment,
      data: ignoredAppointment || null
    });

  } catch (error) {
    console.error("Check ignored appointment error:", error);
    res.status(500).json({ error: "Failed to check ignored appointment" });
  }
}

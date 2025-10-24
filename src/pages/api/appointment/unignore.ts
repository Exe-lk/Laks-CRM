import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
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

    const { request_id, locum_id } = req.body;

    if (!request_id || !locum_id) {
      return res.status(400).json({ error: "Request ID and Locum ID are required" });
    }

    // Check if the ignored appointment exists
    const ignoredAppointment = await prisma.ignoredAppointment.findUnique({
      where: {
        ignored_appointment_unique: {
          request_id,
          locum_id
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

    if (!ignoredAppointment) {
      return res.status(404).json({ error: "Ignored appointment not found" });
    }

    // Delete the ignored appointment record
    await prisma.ignoredAppointment.delete({
      where: {
        ignored_appointment_unique: {
          request_id,
          locum_id
        }
      }
    });

    res.status(200).json({
      success: true,
      data: ignoredAppointment,
      message: "Appointment successfully unignored"
    });

  } catch (error) {
    console.error("Unignore appointment error:", error);
    res.status(500).json({ error: "Failed to unignore appointment" });
  }
}

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

    const { locum_id } = req.query;

    if (!locum_id) {
      return res.status(400).json({ error: "Locum ID required" });
    }

    const applicationHistory = await prisma.appointmentResponse.findMany({
      where: {
        locum_id: locum_id as string
      },
      include: {
        request: {
          include: {
            practice: {
              select: {
                name: true,
                location: true,
                telephone: true
              }
            }
          }
        }
      },
      orderBy: {
        responded_at: 'desc'
      }
    });

    const enhancedHistory = applicationHistory.map(application => ({
      ...application,
      request: {
        ...application.request,
        is_past: application.request.request_date < new Date(),
        status_label: application.status === 'ACCEPTED' ? 'Applied' : 'Rejected'
      }
    }));

    res.status(200).json({
      success: true,
      data: enhancedHistory,
      total: enhancedHistory.length
    });

  } catch (error) {
    console.error("Get locum history error:", error);
    res.status(500).json({ error: "Failed to get application history" });
  }
}
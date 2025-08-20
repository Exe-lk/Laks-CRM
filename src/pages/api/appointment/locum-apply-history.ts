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
            },
            confirmations: {
              where: {
                chosen_locum_id: locum_id as string
              },
              select: {
                status: true,
                locum_confirmed_at: true
              }
            },
            booking: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        responded_at: 'desc'
      }
    });

    const enhancedHistory = applicationHistory.map(application => {
      let statusLabel = '';
      
      if (application.status === 'REJECTED') {
        statusLabel = 'Rejected';
      } else if (application.status === 'ACCEPTED') {
        statusLabel = 'Applied';
      } else if (application.status === 'PRACTICE_CONFIRMED') {
        const confirmation = application.request.confirmations[0];
        if (confirmation) {
          if (confirmation.status === 'LOCUM_CONFIRMED') {
            statusLabel = 'Confirmed';
          } else if (confirmation.status === 'LOCUM_REJECTED') {
            statusLabel = 'Declined by You';
          } else {
            statusLabel = 'Practice Confirmed - Awaiting Your Response';
          }
        } else {
          statusLabel = 'Practice Confirmed';
        }
      }

      if (application.request.booking && application.request.booking.status === 'CONFIRMED') {
        statusLabel = 'Booked';
      } else if (application.request.booking && application.request.booking.status === 'CANCELLED') {
        statusLabel = 'Cancelled';
      }

      return {
        ...application,
        request: {
          ...application.request,
          is_past: application.request.request_date < new Date(),
          status_label: statusLabel
        }
      };
    });

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
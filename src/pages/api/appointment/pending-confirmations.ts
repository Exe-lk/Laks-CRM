import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    console.log("DEBUG: Looking for confirmations with locum_id:", locum_id, typeof locum_id);

    const allConfirmationsForLocum = await prisma.appointmentConfirmation.findMany({
      where: {
        chosen_locum_id: String(locum_id).trim()
      }
    });
    console.log("DEBUG: All confirmations for this locum:", allConfirmationsForLocum.length, allConfirmationsForLocum);

    const allPracticeConfirmed = await prisma.appointmentConfirmation.findMany({
      where: {
        status: "PRACTICE_CONFIRMED"
      }
    });
    console.log("DEBUG: All PRACTICE_CONFIRMED confirmations:", allPracticeConfirmed.length, allPracticeConfirmed);

    const pendingConfirmations = await prisma.appointmentConfirmation.findMany({
      where: {
        chosen_locum_id: String(locum_id).trim(),
        status: "PRACTICE_CONFIRMED"
      },
      include: {
        request: {
          include: {
            practice: {
              select: {
                name: true,
                telephone: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: {
        expires_at: 'asc'
      }
    });

    const now = new Date();

    const expiredConfirmations = pendingConfirmations.filter(
      conf => conf.expires_at && conf.expires_at < now
    );

    if (expiredConfirmations.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const expired of expiredConfirmations) {
          await tx.appointmentConfirmation.update({
            where: { confirmation_id: expired.confirmation_id },
            data: {
              status: "LOCUM_REJECTED",
              rejection_reason: "Expired - No response within time limit"
            }
          });
        }
      });
    }

    const validConfirmations = pendingConfirmations.filter(
      conf => !conf.expires_at || conf.expires_at >= now
    );

    const formattedConfirmations = validConfirmations.map(confirmation => {
      const timeLeft = confirmation.expires_at 
        ? Math.max(0, confirmation.expires_at.getTime() - now.getTime())
        : null;

      return {
        confirmation_id: confirmation.confirmation_id,
        request_id: confirmation.request_id,
        practice: {
          name: confirmation.request.practice.name,
          telephone: confirmation.request.practice.telephone,
          location: confirmation.request.practice.location
        },
        appointment: {
          date: confirmation.request.request_date,
          start_time: confirmation.request.request_start_time,
          end_time: confirmation.request.request_end_time,
          location: confirmation.request.location
        },
        practice_confirmed_at: confirmation.practice_confirmed_at,
        expires_at: confirmation.expires_at,
        time_left_ms: timeLeft,
        time_left_formatted: timeLeft ? {
          hours: Math.floor(timeLeft / (1000 * 60 * 60)),
          minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
        } : null,
        confirmation_number: confirmation.confirmation_number
      };
    });

    res.status(200).json({
      success: true,
      data: {
        pending_confirmations: formattedConfirmations,
        total_pending: formattedConfirmations.length
      }
    });

  } catch (error) {
    console.error("Pending confirmations error:", error);
    res.status(500).json({ error: "Failed to fetch pending confirmations" });
  }
}
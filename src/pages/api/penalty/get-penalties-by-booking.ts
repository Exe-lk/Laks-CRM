import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";
import { applyCors } from '@/lib/api-cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(applyCors(req, res)) return;
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

    const { booking_id } = req.query;

    if (!booking_id || typeof booking_id !== 'string') {
      return res.status(400).json({ error: "booking_id is required" });
    }

    const penalties = await prisma.cancellationPenalty.findMany({
      where: { bookingId: booking_id },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            bookingUniqueid: true,
            booking_date: true,
            booking_start_time: true,
            booking_end_time: true,
            location: true,
            status: true
          }
        },
        chargedLocum: {
          select: {
            id: true,
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            hourlyPayRate: true,
            location: true
          }
        },
        chargedPractice: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
            address: true,
            location: true,
            stripeCustomer: {
              select: {
                stripeCustomerId: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: penalties
    });

  } catch (error) {
    console.error("Get penalties by booking error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch penalties" });
  }
}


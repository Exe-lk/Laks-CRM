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

    const { user_id, user_type } = req.query;

    if (!user_id || !user_type) {
      return res.status(400).json({ error: "User ID and user type required" });
    }

    if (!['locum', 'practice', 'branch'].includes(user_type as string)) {
      return res.status(400).json({ error: "Invalid user type. Must be 'locum', 'practice', or 'branch'" });
    }

    let whereClause;
    if (user_type === 'locum') {
      whereClause = { locum_id: user_id as string };
    } else if (user_type === 'branch') {
      whereClause = { branch_id: user_id as string };
    } else {
      whereClause = { practice_id: user_id as string };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        locumProfile: {
          select: {
            fullName: true,
            contactNumber: true,
            emailAddress: true,
            role: true,
            hourlyPayRate: true
          }
        },
        practice: {
          select: {
            name: true,
            telephone: true,
            location: true,
            address: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            location: true,
            telephone: true
          }
        },
        cancellationPenalties: {
          select: {
            id: true,
            cancelledBy: true,
            cancelledPartyType: true,
            penaltyAmount: true,
            penaltyHours: true,
            hourlyRate: true,
            hoursBeforeAppointment: true,
            status: true,
            reason: true,
            cancellationTime: true,
            chargedLocumId: true,
            chargedPracticeId: true,
            chargedLocum: {
              select: {
                fullName: true
              }
            },
            chargedPractice: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        booking_date: 'desc'
      }
    });

    const enhancedBookings = bookings.map(booking => {
      const now = new Date();
      
      // Use start time for calculating time until booking (for cancellation logic)
      const bookingStartDateTime = new Date(booking.booking_date);
      const [startHours, startMinutes] = booking.booking_start_time.split(':').map(Number);
      bookingStartDateTime.setHours(startHours, startMinutes, 0, 0);
      
      // Use end time to determine if booking is past
      const bookingEndDateTime = new Date(booking.booking_date);
      const [endHours, endMinutes] = booking.booking_end_time.split(':').map(Number);
      bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);
      
      const timeDiffHours = (bookingStartDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return {
        ...booking,
        is_past: bookingEndDateTime < now,
        is_upcoming: bookingEndDateTime > now,
        can_cancel: booking.status === 'CONFIRMED' && timeDiffHours > 0, // Can only cancel if confirmed and job hasn't started
        time_until_booking: Math.max(0, Math.floor(timeDiffHours))
      };
    });

    res.status(200).json({
      success: true,
      data: enhancedBookings,
      total: enhancedBookings.length,
      upcoming: enhancedBookings.filter(b => b.is_upcoming).length,
      past: enhancedBookings.filter(b => b.is_past).length
    });

  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: "Failed to get bookings" });
  }
}
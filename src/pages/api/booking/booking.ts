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

    if (!['locum', 'practice'].includes(user_type as string)) {
      return res.status(400).json({ error: "Invalid user type. Must be 'locum' or 'practice'" });
    }

    const whereClause = user_type === 'locum' 
      ? { locum_id: user_id as string }
      : { practice_id: user_id as string };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        locumProfile: {
          select: {
            fullName: true,
            contactNumber: true,
            emailAddress: true,
            role: true
          }
        },
        practice: {
          select: {
            name: true,
            telephone: true,
            location: true,
            address: true
          }
        }
      },
      orderBy: {
        booking_date: 'desc'
      }
    });

    const enhancedBookings = bookings.map(booking => {
      const now = new Date();
      
      const bookingDateTime = new Date(booking.booking_date);
      const [hours, minutes] = booking.booking_start_time.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      const timeDiffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return {
        ...booking,
        is_past: bookingDateTime < now,
        is_upcoming: bookingDateTime > now,
        can_cancel: timeDiffHours > 48 && booking.status === 'CONFIRMED',
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
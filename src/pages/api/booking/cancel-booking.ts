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

    const { booking_id, user_id, user_type, cancellation_reason } = req.body;

    if (!booking_id || !user_id || !user_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!['locum', 'practice'].includes(user_type)) {
      return res.status(400).json({ error: "Invalid user type. Must be 'locum' or 'practice'" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { booking_id },
        include: {
          locumProfile: { select: { fullName: true } },
          practice: { select: { name: true } }
        }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== 'CONFIRMED') {
        throw new Error("Only confirmed bookings can be cancelled");
      }

      // Verify ownership
      if (user_type === 'locum' && booking.locum_id !== user_id) {
        throw new Error("You can only cancel your own bookings");
      }
      if (user_type === 'practice' && booking.practice_id !== user_id) {
        throw new Error("You can only cancel your practice's bookings");
      }

      // Check 48-hour rule
      const now = new Date();
      const bookingDateTime = new Date(booking.booking_date);
      const timeDiffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (timeDiffHours <= 48) {
        throw new Error("Bookings can only be cancelled more than 48 hours in advance");
      }

      // Cancel the booking
      const cancelledBooking = await tx.booking.update({
        where: { booking_id },
        data: {
          status: 'CANCELLED',
          cancel_by: user_type,
          cancel_time: now,
          description: cancellation_reason || `Cancelled by ${user_type}`
        }
      });
      return cancelledBooking;
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. The appointment is now available for other locums to apply.",
      data: result
    });

  } catch (error) {
    console.error("Cancel booking error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to cancel booking" });
  }
}
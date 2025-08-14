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

    const { request_id, practice_id, cancellation_reason } = req.body;

    if (!request_id || !practice_id) {
      return res.status(400).json({ error: "Request ID and Practice ID are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if request exists and belongs to the practice
      const existingRequest = await tx.appointmentRequest.findUnique({
        where: { request_id },
        include: {
          responses: true,
          confirmations: true,
          booking: true,
          practice: {
            select: { name: true }
          }
        }
      });

      if (!existingRequest) {
        throw new Error("Appointment request not found");
      }

      if (existingRequest.practice_id !== practice_id) {
        throw new Error("You can only delete your own appointment requests");
      }

      // Check if there's a confirmed booking
      if (existingRequest.booking && existingRequest.booking.status === 'CONFIRMED') {
        // Check 48-hour rule for cancellation
        const now = new Date();
        const bookingDateTime = new Date(existingRequest.request_date);
        const timeDiffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (timeDiffHours <= 48) {
          throw new Error("Cannot cancel appointment within 48 hours of the scheduled time");
        }

        // Cancel the booking first
        await tx.booking.update({
          where: { booking_id: existingRequest.booking.booking_id },
          data: {
            status: 'CANCELLED',
            cancel_by: 'practice',
            cancel_time: now,
            description: cancellation_reason || 'Appointment request cancelled by practice'
          }
        });
      }

      // Delete all related records (cascading should handle most, but being explicit)
      await tx.appointmentConfirmation.deleteMany({
        where: { request_id }
      });

      await tx.appointmentResponse.deleteMany({
        where: { request_id }
      });

      // Update status to CANCELLED instead of deleting (for audit trail)
      const cancelledRequest = await tx.appointmentRequest.update({
        where: { request_id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        },
        include: {
          practice: {
            select: { name: true, location: true }
          }
        }
      });

      return {
        cancelledRequest,
        hadConfirmedBooking: !!existingRequest.booking,
        applicantsCount: existingRequest.responses.length
      };
    });

    res.status(200).json({
      success: true,
      data: result.cancelledRequest,
      message: `Appointment request cancelled successfully. ${result.applicantsCount > 0 ? `${result.applicantsCount} applicant(s) have been notified.` : ''}`,
      details: {
        had_confirmed_booking: result.hadConfirmedBooking,
        applicants_notified: result.applicantsCount
      }
    });

  } catch (error) {
    console.error("Delete appointment request error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to cancel appointment request" });
  }
}
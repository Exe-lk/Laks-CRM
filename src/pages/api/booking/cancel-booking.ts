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

    if (!['locum', 'practice', 'branch'].includes(user_type)) {
      return res.status(400).json({ error: "Invalid user type. Must be 'locum', 'practice', or 'branch'" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: booking_id },
        include: {
          locumProfile: { 
            select: { 
              id: true,
              fullName: true,
              hourlyPayRate: true 
            } 
          },
          practice: { 
            select: { 
              id: true,
              name: true 
            } 
          },
          branch: { 
            select: { 
              id: true,
              name: true 
            } 
          }
        }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== 'CONFIRMED') {
        throw new Error("Only confirmed bookings can be cancelled");
      }

      if (user_type === 'locum' && booking.locum_id !== user_id) {
        throw new Error("You can only cancel your own bookings");
      }
      if (user_type === 'practice' && booking.practice_id !== user_id) {
        throw new Error("You can only cancel your practice's bookings");
      }
      if (user_type === 'branch' && booking.branch_id !== user_id) {
        throw new Error("You can only cancel your branch's bookings");
      }

      // Calculate time difference
      const now = new Date();
      const bookingDateTime = new Date(booking.booking_date);
      const [hours, minutes] = booking.booking_start_time.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      const timeDiffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Check if penalty should be applied
      let penaltyData = null;
      
      if (timeDiffHours <= 48) {
        // Penalty applies
        let cancelledPartyId: string;
        let cancelledPartyName: string;
        let cancelledPartyType: string;
        let penaltyHours: number;
        let hourlyRate: number;

        if (user_type === 'locum') {
          // Locum is cancelling - locum gets charged
          if (!booking.locumProfile || !booking.locum_id) {
            throw new Error("Locum profile not found for booking");
          }
          if (!booking.locumProfile.hourlyPayRate) {
            throw new Error("Locum hourly rate not set");
          }

          cancelledPartyId = booking.locum_id;
          cancelledPartyName = booking.locumProfile.fullName;
          cancelledPartyType = 'locum';
          hourlyRate = booking.locumProfile.hourlyPayRate;
          
          // Locum: 3 hours if within 48hrs, 6 hours if within 24hrs
          if (timeDiffHours <= 24) {
            penaltyHours = 6;
          } else {
            penaltyHours = 3;
          }
        } else {
          // Practice or Branch is cancelling - practice gets charged
          // Only charge if within 24 hours
          if (timeDiffHours <= 24) {
            if (!booking.locumProfile || !booking.locum_id) {
              throw new Error("Locum profile not found for booking");
            }
            if (!booking.locumProfile.hourlyPayRate) {
              throw new Error("Locum hourly rate not set for penalty calculation");
            }

            cancelledPartyId = booking.practice_id;
            cancelledPartyName = booking.practice.name;
            cancelledPartyType = 'practice';
            hourlyRate = booking.locumProfile.hourlyPayRate; // Charged at locum's rate
            penaltyHours = 6;
          } else {
            // Practice cancelling between 24-48 hours - no penalty
            penaltyData = null;
          }
        }

        // Create penalty record if applicable
        if ((user_type === 'locum' && timeDiffHours <= 48) || 
            (user_type !== 'locum' && timeDiffHours <= 24)) {
          
          const penaltyAmount = penaltyHours! * hourlyRate!;
          
          penaltyData = await tx.cancellationPenalty.create({
            data: {
              bookingId: booking_id,
              cancelledBy: user_type,
              cancelledPartyId: cancelledPartyId!,
              cancelledPartyName: cancelledPartyName!,
              cancelledPartyType: cancelledPartyType!,
              appointmentStartTime: bookingDateTime,
              cancellationTime: now,
              hoursBeforeAppointment: timeDiffHours,
              penaltyHours: penaltyHours!,
              hourlyRate: hourlyRate!,
              penaltyAmount: penaltyAmount,
              status: 'PENDING',
              reason: cancellation_reason || `Cancelled by ${user_type}`
            }
          });
        }
      }

      // Cancel the booking
      const cancelledBooking = await tx.booking.update({
        where: { id: booking_id },
        data: {
          status: 'CANCELLED',
          cancel_by: user_type,
          cancel_time: now,
          description: cancellation_reason || `Cancelled by ${user_type}`
        }
      });

      // Update appointment request status
      await tx.appointmentRequest.update({
        where: { request_id: booking.request_id },
        data: {
          status: 'CANCELLED',
          updatedAt: now
        }
      });

      return {
        booking: cancelledBooking,
        penalty: penaltyData
      };
    });

    const responseMessage = result.penalty 
      ? `Booking cancelled successfully. A penalty of £${result.penalty.penaltyAmount.toFixed(2)} has been recorded and is pending admin review.`
      : "Booking cancelled successfully. The appointment is now available for other locums to apply.";

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: result.booking,
      penalty: result.penalty
    });

  } catch (error) {
    console.error("Cancel booking error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to cancel booking" });
  }
}
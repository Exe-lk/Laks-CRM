import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ 
        error: "bookingId is required" 
      });
    }

    // Get the booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        locumProfile: true,
        practice: {
          include: {
            branches: true
          }
        },
        request: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (!booking.locumProfile) {
      return res.status(404).json({ error: "Locum profile not found for this booking" });
    }

    // Check if booking is confirmed
    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ 
        error: "Only confirmed bookings can be added to timesheet" 
      });
    }

    // Get or create timesheet for the current month
    const jobDate = new Date(booking.booking_date);
    const currentMonth = jobDate.getMonth() + 1; // 1-12
    const currentYear = jobDate.getFullYear();

    let timesheet = await prisma.timesheet.findUnique({
      where: {
        locum_month_year_unique: {
          locumId: booking.locum_id!,
          month: currentMonth,
          year: currentYear
        }
      }
    });

    if (!timesheet) {
      // Create new timesheet for the month
      timesheet = await prisma.timesheet.create({
        data: {
          locumId: booking.locum_id!,
          month: currentMonth,
          year: currentYear,
          status: 'DRAFT'
        }
      });
    }

    // Check if job already exists in timesheet
    const existingJob = await prisma.timesheetJob.findFirst({
      where: {
        timesheetId: timesheet.id,
        bookingId: bookingId
      }
    });

    if (existingJob) {
      return res.status(400).json({ 
        error: "Job already exists in timesheet" 
      });
    }

    // Determine branch ID for corporate practices
    let branchId = null;
    if (booking.practice.practiceType === "Corporate") {
      // For corporate practices, we need to determine which branch
      // This could be based on location or other criteria
      // For now, we'll use the first branch or require it to be specified
      if (booking.practice.branches.length > 0) {
        branchId = booking.practice.branches[0].id; // Default to first branch
      }
    }

    // Create timesheet job
    const timesheetJob = await prisma.timesheetJob.create({
      data: {
        timesheetId: timesheet.id,
        bookingId: bookingId,
        practiceId: booking.practice_id,
        branchId: branchId,
        jobDate: jobDate,
        hourlyRate: booking.locumProfile.hourlyPayRate || 0,
        notes: `Job at ${booking.practice.name} - ${booking.request.required_role}`
      },
      include: {
        practice: {
          select: {
            name: true,
            location: true,
            practiceType: true
          }
        },
        branch: {
          select: {
            name: true,
            location: true
          }
        },
        booking: {
          select: {
            booking_start_time: true,
            booking_end_time: true,
            location: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Job added to timesheet successfully",
      data: {
        timesheetId: timesheet.id,
        timesheetJobId: timesheetJob.id,
        month: currentMonth,
        year: currentYear,
        jobDate: jobDate,
        practice: timesheetJob.practice,
        branch: timesheetJob.branch,
        booking: timesheetJob.booking,
        hourlyRate: timesheetJob.hourlyRate
      }
    });

  } catch (error) {
    console.error("Add job to timesheet error:", error);
    res.status(500).json({ error: "Failed to add job to timesheet" });
  }
}

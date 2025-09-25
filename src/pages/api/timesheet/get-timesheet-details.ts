import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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

    const { timesheetId } = req.query;

    if (!timesheetId) {
      return res.status(400).json({ error: "timesheetId is required" });
    }

    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId as string },
      include: {
        locumProfile: {
          select: {
            id: true,
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            role: true,
            hourlyPayRate: true
          }
        },
        timesheetJobs: {
          include: {
            practice: {
              select: {
                id: true,
                name: true,
                location: true,
                practiceType: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true,
                location: true
              }
            },
            booking: {
              select: {
                booking_start_time: true,
                booking_end_time: true,
                location: true,
                description: true
              }
            }
          },
          orderBy: {
            jobDate: 'asc'
          }
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Calculate job breakdown
    const jobBreakdown = timesheet.timesheetJobs.map(job => {
      const date = job.jobDate.toISOString().split('T')[0];
      const startTime = job.startTime?.toISOString() || null;
      const endTime = job.endTime?.toISOString() || null;
      const lunchStart = job.lunchStartTime?.toISOString() || null;
      const lunchEnd = job.lunchEndTime?.toISOString() || null;
      
      return {
        id: job.id,
        bookingId: job.bookingId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        lunchStartTime: lunchStart,
        lunchEndTime: lunchEnd,
        totalHours: job.totalHours || 0,
        hourlyRate: job.hourlyRate || 0,
        totalPay: job.totalPay || 0,
        notes: job.notes,
        isComplete: !!(job.startTime && job.endTime),
        practice: job.practice,
        branch: job.branch,
        booking: job.booking
      };
    });

    // Calculate month summary
    const monthSummary = {
      totalJobs: timesheet.timesheetJobs.length,
      completedJobs: timesheet.timesheetJobs.filter(j => j.startTime && j.endTime).length,
      totalHours: timesheet.totalHours || 0,
      totalPay: timesheet.totalPay || 0,
      averageHoursPerJob: timesheet.timesheetJobs.length > 0 
        ? (timesheet.totalHours || 0) / timesheet.timesheetJobs.length 
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        id: timesheet.id,
        locumId: timesheet.locumId,
        month: timesheet.month,
        year: timesheet.year,
        status: timesheet.status,
        totalHours: timesheet.totalHours,
        totalPay: timesheet.totalPay,
        staffSignature: timesheet.staffSignature,
        staffSignatureDate: timesheet.staffSignatureDate,
        managerSignature: timesheet.managerSignature,
        managerSignatureDate: timesheet.managerSignatureDate,
        managerId: timesheet.managerId,
        submittedAt: timesheet.submittedAt,
        createdAt: timesheet.createdAt,
        updatedAt: timesheet.updatedAt,
        locumProfile: timesheet.locumProfile,
        jobBreakdown: jobBreakdown,
        monthSummary: monthSummary
      }
    });

  } catch (error) {
    console.error("Get timesheet error:", error);
    res.status(500).json({ error: "Failed to get timesheet" });
  }
}

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
        practice: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
            location: true,
            address: true,
            practiceType: true
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
        timesheetEntries: {
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Calculate daily breakdown
    const dailyBreakdown = timesheet.timesheetEntries.map(entry => {
      const date = entry.date.toISOString().split('T')[0];
      const clockIn = entry.clockInTime?.toISOString() || null;
      const clockOut = entry.clockOutTime?.toISOString() || null;
      const lunchStart = entry.lunchStartTime?.toISOString() || null;
      const lunchEnd = entry.lunchEndTime?.toISOString() || null;
      
      return {
        id: entry.id,
        date: date,
        clockInTime: clockIn,
        clockOutTime: clockOut,
        lunchStartTime: lunchStart,
        lunchEndTime: lunchEnd,
        totalHours: entry.totalHours || 0,
        notes: entry.notes,
        isComplete: !!(entry.clockInTime && entry.clockOutTime)
      };
    });

    // Calculate week summary
    const weekSummary = {
      totalDays: timesheet.timesheetEntries.length,
      completedDays: timesheet.timesheetEntries.filter(e => e.clockInTime && e.clockOutTime).length,
      totalHours: timesheet.totalHours || 0,
      totalPay: timesheet.totalPay || 0,
      hourlyRate: timesheet.hourlyRate || 0,
      averageHoursPerDay: timesheet.timesheetEntries.length > 0 
        ? (timesheet.totalHours || 0) / timesheet.timesheetEntries.length 
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        id: timesheet.id,
        locumId: timesheet.locumId,
        practiceId: timesheet.practiceId,
        weekStartDate: timesheet.weekStartDate,
        weekEndDate: timesheet.weekEndDate,
        status: timesheet.status,
        totalHours: timesheet.totalHours,
        totalPay: timesheet.totalPay,
        hourlyRate: timesheet.hourlyRate,
        staffSignature: timesheet.staffSignature,
        staffSignatureDate: timesheet.staffSignatureDate,
        managerSignature: timesheet.managerSignature,
        managerSignatureDate: timesheet.managerSignatureDate,
        managerId: timesheet.managerId,
        submittedAt: timesheet.submittedAt,
        createdAt: timesheet.createdAt,
        updatedAt: timesheet.updatedAt,
        locumProfile: timesheet.locumProfile,
        practice: timesheet.practice,
        branch: timesheet.branch,
        createdBy: timesheet.createdBy,
        dailyBreakdown: dailyBreakdown,
        weekSummary: weekSummary
      }
    });

  } catch (error) {
    console.error("Get timesheet error:", error);
    res.status(500).json({ error: "Failed to get timesheet" });
  }
}

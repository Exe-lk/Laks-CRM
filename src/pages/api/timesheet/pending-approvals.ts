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

    const { practiceId } = req.query;

    if (!practiceId) {
      return res.status(400).json({ error: "practiceId is required" });
    }

    // Get all timesheets pending approval for this practice (only locum-created timesheets need approval)
    const pendingTimesheets = await prisma.timesheet.findMany({
      where: {
        practiceId: practiceId as string,
        status: 'PENDING_APPROVAL',
        createdBy: 'LOCUM' // Only locum-created timesheets need approval
      },
      include: {
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            role: true,
            hourlyPayRate: true
          }
        },
        practice: {
          select: {
            name: true,
            email: true,
            telephone: true,
            location: true,
            practiceType: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            location: true
          }
        },
        timesheetEntries: {
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        staffSignatureDate: 'asc' // Oldest submissions first
      }
    });

    // Calculate summary for pending timesheets
    const summary = {
      totalPending: pendingTimesheets.length,
      totalHours: pendingTimesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0),
      totalPay: pendingTimesheets.reduce((sum, t) => sum + (t.totalPay || 0), 0),
      averageHoursPerTimesheet: pendingTimesheets.length > 0 
        ? pendingTimesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0) / pendingTimesheets.length 
        : 0
    };

    // Add additional metadata to each timesheet
    const enhancedTimesheets = pendingTimesheets.map(timesheet => {
      const daysSinceSubmission = timesheet.staffSignatureDate 
        ? Math.floor((new Date().getTime() - timesheet.staffSignatureDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const completedDays = timesheet.timesheetEntries.filter(entry => 
        entry.clockInTime && entry.clockOutTime
      ).length;

      const totalDays = timesheet.timesheetEntries.length;

      return {
        ...timesheet,
        daysSinceSubmission,
        completedDays,
        totalDays,
        completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
        isOverdue: daysSinceSubmission > 7 // Consider overdue after 7 days
      };
    });

    res.status(200).json({
      success: true,
      data: enhancedTimesheets,
      summary: summary
    });

  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ error: "Failed to get pending timesheet approvals" });
  }
}

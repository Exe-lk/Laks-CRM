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

    const { month, year } = req.query;

    // Build where clause for submitted timesheets
    let whereClause: any = {
      status: 'SUBMITTED'
    };

    // Add month/year filter if provided
    if (month) {
      whereClause.month = parseInt(month as string);
    }
    if (year) {
      whereClause.year = parseInt(year as string);
    }

    // Get all submitted timesheets
    const pendingTimesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            role: true
          }
        },
        timesheetJobs: {
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
            }
          },
          orderBy: {
            jobDate: 'asc'
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

      const completedJobs = timesheet.timesheetJobs.filter(job => 
        job.startTime && job.endTime
      ).length;

      const totalJobs = timesheet.timesheetJobs.length;

      return {
        ...timesheet,
        daysSinceSubmission,
        completedJobs,
        totalJobs,
        completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
        isOverdue: daysSinceSubmission > 7 // Consider overdue after 7 days
      };
    });

    res.status(200).json({
      success: true,
      data: enhancedTimesheets,
      summary: summary
    });

  } catch (error) {
    console.error("Get pending timesheets error:", error);
    res.status(500).json({ error: "Failed to get pending timesheets" });
  }
}

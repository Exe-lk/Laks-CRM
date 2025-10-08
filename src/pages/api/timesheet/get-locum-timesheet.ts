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

    const { locumId, month, year, weekStartDate } = req.query;

    if (!locumId) {
      return res.status(400).json({ error: "locumId is required" });
    }

    // Default to current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();

    // Get or create timesheet for the month
    let timesheet = await prisma.timesheet.findUnique({
      where: {
        locum_month_year_unique: {
          locumId: locumId as string,
          month: targetMonth,
          year: targetYear
        }
      },
      include: {
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            role: true
          }
        }
      }
    });

    if (!timesheet) {
      // Create new timesheet for the month
      timesheet = await prisma.timesheet.create({
        data: {
          locumId: locumId as string,
          month: targetMonth,
          year: targetYear,
          status: 'DRAFT'
        },
        include: {
          locumProfile: {
            select: {
              fullName: true,
              emailAddress: true,
              contactNumber: true,
              role: true
            }
          }
        }
      });
    }

    // Get all jobs for the timesheet
    let whereClause: any = {
      timesheetId: timesheet.id
    };

    // If weekStartDate is provided, filter for that week
    if (weekStartDate) {
      const weekStart = new Date(weekStartDate as string);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      whereClause.jobDate = {
        gte: weekStart,
        lte: weekEnd
      };
    }

    const timesheetJobs = await prisma.timesheetJob.findMany({
      where: whereClause,
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
            location: true,
            description: true
          }
        }
      },
      orderBy: {
        jobDate: 'asc'
      }
    });

    // Group jobs by week for weekly view
    const jobsByWeek: { [key: string]: any[] } = {};
    timesheetJobs.forEach(job => {
      const jobDate = new Date(job.jobDate);
      const weekStart = new Date(jobDate);
      weekStart.setDate(jobDate.getDate() - jobDate.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!jobsByWeek[weekKey]) {
        jobsByWeek[weekKey] = [];
      }
      jobsByWeek[weekKey].push(job);
    });

    // Calculate weekly summaries
    const weeklySummaries = Object.keys(jobsByWeek).map(weekKey => {
      const weekJobs = jobsByWeek[weekKey];
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekTotalHours = weekJobs.reduce((sum, job) => sum + (job.totalHours || 0), 0);
      const weekTotalPay = weekJobs.reduce((sum, job) => sum + (job.totalPay || 0), 0);
      const completedJobs = weekJobs.filter(job => job.startTime && job.endTime).length;

      return {
        weekStart: weekKey,
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalJobs: weekJobs.length,
        completedJobs: completedJobs,
        totalHours: weekTotalHours,
        totalPay: weekTotalPay,
        jobs: weekJobs
      };
    });

    // Calculate month summary
    const monthSummary = {
      totalJobs: timesheetJobs.length,
      completedJobs: timesheetJobs.filter(job => job.startTime && job.endTime).length,
      totalHours: timesheet.totalHours || 0,
      totalPay: timesheet.totalPay || 0,
      totalWeeks: Object.keys(jobsByWeek).length,
      averageHoursPerWeek: Object.keys(jobsByWeek).length > 0 
        ? (timesheet.totalHours || 0) / Object.keys(jobsByWeek).length 
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        timesheet: {
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
          submittedAt: timesheet.submittedAt,
          createdAt: timesheet.createdAt,
          updatedAt: timesheet.updatedAt,
          locumProfile: timesheet.locumProfile
        },
        allJobs: timesheetJobs,
        jobsByWeek: jobsByWeek,
        weeklySummaries: weeklySummaries,
        monthSummary: monthSummary
      }
    });

  } catch (error) {
    console.error("Get locum timesheet error:", error);
    res.status(500).json({ error: "Failed to get locum timesheet" });
  }
}

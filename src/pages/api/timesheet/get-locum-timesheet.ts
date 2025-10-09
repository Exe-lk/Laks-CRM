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

    // Build where clause for timesheets
    let timesheetWhereClause: any = {
      locumId: locumId as string
    };

    // Add month/year filter if provided
    if (month) {
      timesheetWhereClause.month = targetMonth;
    }
    if (year) {
      timesheetWhereClause.year = targetYear;
    }

    // Get all timesheets for this locum (filtered by month/year if provided)
    const timesheets = await prisma.timesheet.findMany({
      where: timesheetWhereClause,
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
            },
            booking: {
              select: {
                booking_start_time: true,
                booking_end_time: true,
                location: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Flatten all jobs from all timesheets
    let allJobs = timesheets.flatMap(ts => ts.timesheetJobs);

    // If weekStartDate is provided, filter jobs for that week
    if (weekStartDate) {
      const weekStart = new Date(weekStartDate as string);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      allJobs = allJobs.filter(job => {
        const jobDate = new Date(job.jobDate);
        return jobDate >= weekStart && jobDate <= weekEnd;
      });
    }

    const timesheetJobs = allJobs.sort((a, b) => {
      return new Date(a.jobDate).getTime() - new Date(b.jobDate).getTime();
    });

    // For compatibility, we'll keep the old structure but return aggregated data
    const timesheetJobsQuery = await prisma.timesheetJob.findMany({
      where: {
        timesheetId: {
          in: timesheets.map(ts => ts.id)
        }
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

    // Calculate aggregated totals from all timesheets
    const aggregatedTotalHours = timesheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0);
    const aggregatedTotalPay = timesheets.reduce((sum, ts) => sum + (ts.totalPay || 0), 0);

    // Calculate month summary
    const monthSummary = {
      totalJobs: timesheetJobs.length,
      completedJobs: timesheetJobs.filter(job => job.startTime && job.endTime).length,
      totalHours: aggregatedTotalHours,
      totalPay: aggregatedTotalPay,
      totalWeeks: Object.keys(jobsByWeek).length,
      averageHoursPerWeek: Object.keys(jobsByWeek).length > 0 
        ? aggregatedTotalHours / Object.keys(jobsByWeek).length 
        : 0,
      totalTimesheets: timesheets.length
    };

    // For backward compatibility, return aggregated timesheet data
    const aggregatedTimesheet = {
      id: timesheets.length > 0 ? timesheets[0].id : null,
      locumId: locumId as string,
      month: targetMonth,
      year: targetYear,
      status: 'MULTIPLE', // Indicate multiple timesheets
      totalHours: aggregatedTotalHours,
      totalPay: aggregatedTotalPay,
      timesheets: timesheets.map(ts => ({
        id: ts.id,
        status: ts.status,
        totalHours: ts.totalHours,
        totalPay: ts.totalPay,
        staffSignature: ts.staffSignature,
        staffSignatureDate: ts.staffSignatureDate,
        managerSignature: ts.managerSignature,
        managerSignatureDate: ts.managerSignatureDate,
        submittedAt: ts.submittedAt,
        createdAt: ts.createdAt,
        updatedAt: ts.updatedAt,
        jobCount: ts.timesheetJobs.length
      })),
      locumProfile: timesheets.length > 0 ? timesheets[0].locumProfile : null
    };

    res.status(200).json({
      success: true,
      data: {
        timesheet: aggregatedTimesheet,
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

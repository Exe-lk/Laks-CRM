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

    // Build where clause for timesheets
    let whereClause: any = {};

    // Add month/year filter if provided
    if (month) {
      whereClause.month = parseInt(month as string);
    }
    if (year) {
      whereClause.year = parseInt(year as string);
    }

    // Get all timesheets that have at least one LOCKED job
    const allTimesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            role: true,
            bankDetails: true
          }
        },
        timesheetJobs: {
          include: {
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
        month: 'desc',
        year: 'desc'
      }
    });

    // Filter to only timesheets with LOCKED jobs
    const lockedTimesheets = allTimesheets.filter(timesheet => 
      timesheet.timesheetJobs.some(job => job.status === 'LOCKED')
    );

    // Filter jobs to only include LOCKED ones for payout calculations
    const lockedTimesheetsWithFilteredJobs = lockedTimesheets.map(timesheet => ({
      ...timesheet,
      timesheetJobs: timesheet.timesheetJobs.filter(job => job.status === 'LOCKED')
    }));

    // Group by locum for individual payouts
    const payoutsByLocum = lockedTimesheetsWithFilteredJobs.reduce((acc: any, timesheet: any) => {
      const locumId = timesheet.locumId;
      const locumName = timesheet.locumProfile.fullName;
      
      if (!acc[locumId]) {
        acc[locumId] = {
          locumId,
          locumName,
          locumEmail: timesheet.locumProfile.emailAddress,
          locumContact: timesheet.locumProfile.contactNumber,
          locumRole: timesheet.locumProfile.role,
          bankDetails: timesheet.locumProfile.bankDetails,
          timesheets: [],
          totalHours: 0,
          totalPay: 0,
          totalJobs: 0
        };
      }
      
      acc[locumId].timesheets.push(timesheet);
      acc[locumId].totalHours += timesheet.totalHours || 0;
      acc[locumId].totalPay += timesheet.totalPay || 0;
      acc[locumId].totalJobs += timesheet.timesheetJobs.length;
      
      return acc;
    }, {} as any);

    // Group by practice for practice-wise payouts
    const payoutsByPractice = lockedTimesheetsWithFilteredJobs.reduce((acc: any, timesheet: any) => {
      timesheet.timesheetJobs.forEach((job: any) => {
        const practiceId = job.practiceId;
        const practiceName = job.practice.name;
        
        if (!acc[practiceId]) {
          acc[practiceId] = {
            practiceId,
            practiceName,
            practiceEmail: job.practice.email,
            practiceLocation: job.practice.location,
            practiceType: job.practice.practiceType,
            jobs: [],
            totalHours: 0,
            totalPay: 0,
            locumCount: 0
          };
        }
        
        acc[practiceId].jobs.push(job);
        acc[practiceId].totalHours += job.totalHours || 0;
        acc[practiceId].totalPay += job.totalPay || 0;
        
        // Count unique locums for this practice
        const locumIds = new Set(acc[practiceId].jobs.map((j: any) => j.timesheet.locumId));
        acc[practiceId].locumCount = locumIds.size;
      });
      
      return acc;
    }, {} as any);

    // Calculate overall summary (only count LOCKED jobs)
    const totalLockedJobs = lockedTimesheetsWithFilteredJobs.reduce((sum: number, t: any) => sum + t.timesheetJobs.length, 0);
    const totalHours = lockedTimesheetsWithFilteredJobs.reduce((sum: number, t: any) => 
      sum + t.timesheetJobs.reduce((jobSum: number, job: any) => jobSum + (job.totalHours || 0), 0), 0
    );
    const totalPay = lockedTimesheetsWithFilteredJobs.reduce((sum: number, t: any) => 
      sum + t.timesheetJobs.reduce((jobSum: number, job: any) => jobSum + (job.totalPay || 0), 0), 0
    );

    const summary = {
      totalTimesheets: lockedTimesheets.length,
      totalLockedJobs: totalLockedJobs,
      totalHours: totalHours,
      totalPay: totalPay,
      uniquePractices: Object.keys(payoutsByPractice).length,
      uniqueLocums: Object.keys(payoutsByLocum).length,
      averageHoursPerJob: totalLockedJobs > 0 ? totalHours / totalLockedJobs : 0,
      averagePayPerJob: totalLockedJobs > 0 ? totalPay / totalLockedJobs : 0
    };

    res.status(200).json({
      success: true,
      data: {
        allTimesheets: lockedTimesheets,
        payoutsByPractice: Object.values(payoutsByPractice),
        payoutsByLocum: Object.values(payoutsByLocum),
        summary: summary
      }
    });

  } catch (error) {
    console.error("Get weekly payouts error:", error);
    res.status(500).json({ error: "Failed to get weekly payout data" });
  }
}

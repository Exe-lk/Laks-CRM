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

    const { weekStartDate, weekEndDate, practiceId } = req.query;

    // Build where clause for locked timesheets
    let whereClause: any = {
      status: 'LOCKED'
    };

    // Add date range filter if provided
    if (weekStartDate || weekEndDate) {
      whereClause.weekStartDate = {};
      if (weekStartDate) {
        whereClause.weekStartDate.gte = new Date(weekStartDate as string);
      }
      if (weekEndDate) {
        whereClause.weekStartDate.lte = new Date(weekEndDate as string);
      }
    }

    // Add practice filter if provided
    if (practiceId) {
      whereClause.practiceId = practiceId as string;
    }

    // Get all locked timesheets for payout
    const lockedTimesheets = await prisma.timesheet.findMany({
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
        weekStartDate: 'desc'
      }
    });

    // Group by practice for easier processing
    const payoutsByPractice = lockedTimesheets.reduce((acc: any, timesheet: any) => {
      const practiceId = timesheet.practiceId;
      const practiceName = timesheet.practice.name;
      
      if (!acc[practiceId]) {
        acc[practiceId] = {
          practiceId,
          practiceName,
          practiceEmail: timesheet.practice.email,
          practiceLocation: timesheet.practice.location,
          timesheets: [],
          totalHours: 0,
          totalPay: 0,
          locumCount: 0
        };
      }
      
      acc[practiceId].timesheets.push(timesheet);
      acc[practiceId].totalHours += timesheet.totalHours || 0;
      acc[practiceId].totalPay += timesheet.totalPay || 0;
      acc[practiceId].locumCount += 1;
      
      return acc;
    }, {} as any);

    // Group by locum for individual payouts
    const payoutsByLocum = lockedTimesheets.reduce((acc: any, timesheet: any) => {
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
          practiceCount: 0
        };
      }
      
      acc[locumId].timesheets.push(timesheet);
      acc[locumId].totalHours += timesheet.totalHours || 0;
      acc[locumId].totalPay += timesheet.totalPay || 0;
      acc[locumId].practiceCount += 1;
      
      return acc;
    }, {} as any);

    // Calculate overall summary
    const summary = {
      totalTimesheets: lockedTimesheets.length,
      totalHours: lockedTimesheets.reduce((sum: number, t: any) => sum + (t.totalHours || 0), 0),
      totalPay: lockedTimesheets.reduce((sum: number, t: any) => sum + (t.totalPay || 0), 0),
      uniquePractices: Object.keys(payoutsByPractice).length,
      uniqueLocums: Object.keys(payoutsByLocum).length,
      averageHoursPerTimesheet: lockedTimesheets.length > 0 
        ? lockedTimesheets.reduce((sum: number, t: any) => sum + (t.totalHours || 0), 0) / lockedTimesheets.length 
        : 0,
      averagePayPerTimesheet: lockedTimesheets.length > 0 
        ? lockedTimesheets.reduce((sum: number, t: any) => sum + (t.totalPay || 0), 0) / lockedTimesheets.length 
        : 0
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

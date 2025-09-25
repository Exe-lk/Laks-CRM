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

    const { userId, userType, status, month, year } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({ error: "userId and userType are required" });
    }

    if (!['locum', 'admin'].includes(userType as string)) {
      return res.status(400).json({ 
        error: "Invalid userType. Must be 'locum' or 'admin'" 
      });
    }

    // Build where clause based on user type
    let whereClause: any = {};

    if (userType === 'locum') {
      whereClause.locumId = userId as string;
    }
    // For admin, no additional filtering (can see all timesheets)

    // Add status filter if provided
    if (status) {
      whereClause.status = status as string;
    }

    // Add month/year filter if provided
    if (month) {
      whereClause.month = parseInt(month as string);
    }
    if (year) {
      whereClause.year = parseInt(year as string);
    }

    const timesheets = await prisma.timesheet.findMany({
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
        year: 'desc',
        month: 'desc'
      }
    });

    // Calculate summary statistics
    const summary = {
      total: timesheets.length,
      draft: timesheets.filter(t => t.status === 'DRAFT').length,
      submitted: timesheets.filter(t => t.status === 'SUBMITTED').length,
      locked: timesheets.filter(t => t.status === 'LOCKED').length,
      totalHours: timesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0),
      totalPay: timesheets.reduce((sum, t) => sum + (t.totalPay || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: timesheets,
      summary: summary
    });

  } catch (error) {
    console.error("Get timesheets error:", error);
    res.status(500).json({ error: "Failed to get timesheets" });
  }
}

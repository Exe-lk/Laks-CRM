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

    const { branchId, status, weekStartDate, weekEndDate } = req.query;

    if (!branchId) {
      return res.status(400).json({ error: "branchId is required" });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId as string },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
            location: true,
            practiceType: true
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Build where clause
    let whereClause: any = {
      branchId: branchId as string
    };

    // Add status filter if provided
    if (status) {
      whereClause.status = status as string;
    }

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

    // Calculate summary statistics
    const summary = {
      total: timesheets.length,
      draft: timesheets.filter(t => t.status === 'DRAFT').length,
      pendingApproval: timesheets.filter(t => t.status === 'PENDING_APPROVAL').length,
      locked: timesheets.filter(t => t.status === 'LOCKED').length,
      totalHours: timesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0),
      totalPay: timesheets.reduce((sum, t) => sum + (t.totalPay || 0), 0),
      locumCreated: timesheets.filter(t => t.createdBy === 'LOCUM').length,
      practiceCreated: timesheets.filter(t => t.createdBy === 'PRACTICE').length
    };

    res.status(200).json({
      success: true,
      data: {
        branch: {
          id: branch.id,
          name: branch.name,
          address: branch.address,
          location: branch.location,
          practice: branch.practice
        },
        timesheets: timesheets,
        summary: summary
      }
    });

  } catch (error) {
    console.error("Get branch timesheets error:", error);
    res.status(500).json({ error: "Failed to get branch timesheets" });
  }
}

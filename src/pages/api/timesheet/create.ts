import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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

    const { locumId, practiceId, branchId, weekStartDate, hourlyRate } = req.body;

    if (!locumId || !practiceId || !weekStartDate) {
      return res.status(400).json({ 
        error: "locumId, practiceId, and weekStartDate are required" 
      });
    }

    // Verify locum exists
    const locumProfile = await prisma.locumProfile.findUnique({
      where: { id: locumId }
    });

    if (!locumProfile) {
      return res.status(404).json({ error: "Locum profile not found" });
    }

    // Verify practice exists and get its type
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      include: {
        branches: true
      }
    });

    if (!practice) {
      return res.status(404).json({ error: "Practice not found" });
    }

    // For corporate practices, branchId is required
    if (practice.practiceType === "Corporate" && !branchId) {
      return res.status(400).json({ 
        error: "branchId is required for corporate practices" 
      });
    }

    // For individual practices, branchId should not be provided
    if (practice.practiceType === "Private" && branchId) {
      return res.status(400).json({ 
        error: "branchId should not be provided for individual practices" 
      });
    }

    // If branchId is provided, verify it belongs to the practice
    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: branchId,
          practiceId: practiceId
        }
      });

      if (!branch) {
        return res.status(404).json({ 
          error: "Branch not found or does not belong to this practice" 
        });
      }
    }

    // Calculate week dates
    const weekStart = new Date(weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    // Check if timesheet already exists for this locum, week, and branch
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: {
        locum_week_branch_unique: {
          locumId: locumId,
          weekStartDate: weekStart,
          branchId: branchId || null
        }
      }
    });

    if (existingTimesheet) {
      return res.status(400).json({ 
        error: "Timesheet already exists for this locum, week, and branch" 
      });
    }

    // Create the timesheet
    const timesheet = await prisma.timesheet.create({
      data: {
        locumId: locumId,
        practiceId: practiceId,
        branchId: branchId || null,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        status: 'DRAFT',
        hourlyRate: hourlyRate || locumProfile.hourlyPayRate || 0,
        createdBy: 'PRACTICE' // Practice creates the timesheet
      },
      include: {
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true,
            contactNumber: true,
            role: true
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
        branch: branchId ? {
          select: {
            id: true,
            name: true,
            address: true,
            location: true
          }
        } : undefined
      }
    });

    res.status(201).json({
      success: true,
      message: "Timesheet created successfully",
      data: {
        id: timesheet.id,
        locumId: timesheet.locumId,
        practiceId: timesheet.practiceId,
        branchId: timesheet.branchId,
        weekStartDate: timesheet.weekStartDate,
        weekEndDate: timesheet.weekEndDate,
        status: timesheet.status,
        hourlyRate: timesheet.hourlyRate,
        createdBy: timesheet.createdBy,
        locumProfile: timesheet.locumProfile,
        practice: timesheet.practice,
        branch: timesheet.branch,
        createdAt: timesheet.createdAt
      }
    });

  } catch (error) {
    console.error("Create timesheet error:", error);
    res.status(500).json({ error: "Failed to create timesheet" });
  }
}

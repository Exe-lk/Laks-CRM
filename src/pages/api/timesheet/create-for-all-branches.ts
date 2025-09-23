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

    const { locumId, practiceId, weekStartDate, hourlyRate } = req.body;

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

    // Verify practice exists and get its branches
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      include: {
        branches: true
      }
    });

    if (!practice) {
      return res.status(404).json({ error: "Practice not found" });
    }

    // Check if practice is corporate
    if (practice.practiceType !== "Corporate") {
      return res.status(400).json({ 
        error: "This endpoint is only for corporate practices. Use the regular create endpoint for individual practices." 
      });
    }

    // Check if practice has branches
    if (practice.branches.length === 0) {
      return res.status(400).json({ 
        error: "Corporate practice has no branches" 
      });
    }

    // Calculate week dates
    const weekStart = new Date(weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    const createdTimesheets = [];
    const errors = [];

    // Create timesheet for each branch
    for (const branch of practice.branches) {
      try {
        // Check if timesheet already exists for this locum, week, and branch
        const existingTimesheet = await prisma.timesheet.findUnique({
          where: {
            locum_week_branch_unique: {
              locumId: locumId,
              weekStartDate: weekStart,
              branchId: branch.id
            }
          }
        });

        if (existingTimesheet) {
          errors.push({
            branchId: branch.id,
            branchName: branch.name,
            error: "Timesheet already exists for this locum, week, and branch"
          });
          continue;
        }

        // Create the timesheet for this branch
        const timesheet = await prisma.timesheet.create({
          data: {
            locumId: locumId,
            practiceId: practiceId,
            branchId: branch.id,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            status: 'DRAFT',
            hourlyRate: hourlyRate || locumProfile.hourlyPayRate || 0,
            createdBy: 'PRACTICE' // Practice creates the timesheet
          },
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                address: true,
                location: true
              }
            }
          }
        });

        createdTimesheets.push(timesheet);
      } catch (error) {
        errors.push({
          branchId: branch.id,
          branchName: branch.name,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdTimesheets.length} timesheets for ${practice.branches.length} branches`,
      data: {
        practice: {
          id: practice.id,
          name: practice.name,
          practiceType: practice.practiceType,
          totalBranches: practice.branches.length
        },
        locum: {
          id: locumProfile.id,
          name: locumProfile.fullName,
          email: locumProfile.emailAddress
        },
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        createdTimesheets: createdTimesheets,
        errors: errors,
        summary: {
          totalBranches: practice.branches.length,
          successful: createdTimesheets.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error("Create timesheets for all branches error:", error);
    res.status(500).json({ error: "Failed to create timesheets for all branches" });
  }
}

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

    const { timesheetId, staffSignature } = req.body;

    if (!timesheetId || !staffSignature) {
      return res.status(400).json({ 
        error: "timesheetId and staffSignature are required" 
      });
    }

    // Get the timesheet with entries
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        timesheetEntries: true,
        locumProfile: true,
        practice: true
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Check if timesheet is in DRAFT status
    if (timesheet.status !== 'DRAFT') {
      return res.status(400).json({ 
        error: `Timesheet is already ${timesheet.status.toLowerCase()}` 
      });
    }

    // If timesheet was created by practice, it doesn't need approval - lock it directly
    if (timesheet.createdBy === 'PRACTICE') {
      const updatedTimesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: {
          staffSignature: staffSignature,
          staffSignatureDate: new Date(),
          status: 'LOCKED',
          submittedAt: new Date()
        },
        include: {
          timesheetEntries: true,
          locumProfile: {
            select: {
              fullName: true,
              emailAddress: true
            }
          },
          practice: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        message: "Practice-created timesheet submitted and locked successfully",
        data: {
          timesheetId: updatedTimesheet.id,
          status: updatedTimesheet.status,
          staffSignatureDate: updatedTimesheet.staffSignatureDate,
          submittedAt: updatedTimesheet.submittedAt,
          totalHours: updatedTimesheet.totalHours,
          totalPay: updatedTimesheet.totalPay,
          weekStartDate: updatedTimesheet.weekStartDate,
          weekEndDate: updatedTimesheet.weekEndDate,
          locumName: updatedTimesheet.locumProfile.fullName,
          practiceName: updatedTimesheet.practice.name,
          createdBy: updatedTimesheet.createdBy
        }
      });
    }

    // Validate that all entries have complete clock-in/clock-out times
    const incompleteEntries = timesheet.timesheetEntries.filter(entry => 
      !entry.clockInTime || !entry.clockOutTime
    );

    if (incompleteEntries.length > 0) {
      return res.status(400).json({ 
        error: "All timesheet entries must have complete clock-in and clock-out times before submission" 
      });
    }

    // Validate that total hours is greater than 0
    if (!timesheet.totalHours || timesheet.totalHours <= 0) {
      return res.status(400).json({ 
        error: "Total hours must be greater than 0" 
      });
    }

    // Update timesheet with staff signature and change status to PENDING_APPROVAL
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        staffSignature: staffSignature,
        staffSignatureDate: new Date(),
        status: 'PENDING_APPROVAL'
      },
      include: {
        timesheetEntries: true,
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true
          }
        },
        practice: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Timesheet submitted successfully and is now pending manager approval",
      data: {
        timesheetId: updatedTimesheet.id,
        status: updatedTimesheet.status,
        staffSignatureDate: updatedTimesheet.staffSignatureDate,
        totalHours: updatedTimesheet.totalHours,
        totalPay: updatedTimesheet.totalPay,
        weekStartDate: updatedTimesheet.weekStartDate,
        weekEndDate: updatedTimesheet.weekEndDate,
        locumName: updatedTimesheet.locumProfile.fullName,
        practiceName: updatedTimesheet.practice.name
      }
    });

  } catch (error) {
    console.error("Timesheet submission error:", error);
    res.status(500).json({ error: "Failed to submit timesheet" });
  }
}

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

    const { timesheetId, managerSignature, managerId, action } = req.body;

    if (!timesheetId || !managerSignature || !managerId || !action) {
      return res.status(400).json({ 
        error: "timesheetId, managerSignature, managerId, and action are required" 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: "Invalid action. Must be 'approve' or 'reject'" 
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

    // Check if timesheet is in PENDING_APPROVAL status
    if (timesheet.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ 
        error: `Timesheet is not pending approval. Current status: ${timesheet.status}` 
      });
    }

    // Verify that the manager belongs to the same practice
    const practice = await prisma.practice.findUnique({
      where: { id: timesheet.practiceId }
    });

    if (!practice) {
      return res.status(404).json({ error: "Practice not found" });
    }

    // For now, we'll assume managerId is the practice email or ID
    // In a real implementation, you might have a separate managers table
    const isValidManager = practice.email === managerId || practice.id === managerId;
    
    if (!isValidManager) {
      return res.status(403).json({ 
        error: "Unauthorized: Manager does not belong to this practice" 
      });
    }

    let updatedTimesheet;
    let newStatus;

    if (action === 'approve') {
      // Approve and lock the timesheet
      updatedTimesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: {
          managerSignature: managerSignature,
          managerSignatureDate: new Date(),
          managerId: managerId,
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
      newStatus = 'LOCKED';
    } else {
      // Reject and return to DRAFT status
      updatedTimesheet = await prisma.timesheet.update({
        where: { id: timesheetId },
        data: {
          status: 'DRAFT',
          staffSignature: null,
          staffSignatureDate: null
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
      newStatus = 'DRAFT';
    }

    res.status(200).json({
      success: true,
      message: `Timesheet ${action === 'approve' ? 'approved and locked' : 'rejected and returned to draft'}`,
      data: {
        timesheetId: updatedTimesheet.id,
        status: newStatus,
        managerSignatureDate: action === 'approve' ? updatedTimesheet.managerSignatureDate : null,
        submittedAt: action === 'approve' ? updatedTimesheet.submittedAt : null,
        totalHours: updatedTimesheet.totalHours,
        totalPay: updatedTimesheet.totalPay,
        weekStartDate: updatedTimesheet.weekStartDate,
        weekEndDate: updatedTimesheet.weekEndDate,
        locumName: updatedTimesheet.locumProfile.fullName,
        practiceName: updatedTimesheet.practice.name
      }
    });

  } catch (error) {
    console.error("Timesheet approval error:", error);
    res.status(500).json({ error: "Failed to process timesheet approval" });
  }
}

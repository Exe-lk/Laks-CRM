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

    const { timesheetId, reason } = req.body;

    if (!timesheetId) {
      return res.status(400).json({ 
        error: "timesheetId is required" 
      });
    }

    // Get the timesheet
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        timesheetJobs: true,
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true
          }
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Check if timesheet is LOCKED or SUBMITTED
    if (timesheet.status !== 'LOCKED' && timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: `Timesheet cannot be unlocked. Current status: ${timesheet.status}`,
        details: "Only LOCKED or SUBMITTED timesheets can be unlocked."
      });
    }

    // Unlock the timesheet by returning it to DRAFT status
    // Clear manager signature and approval data
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'DRAFT',
        managerSignature: null,
        managerSignatureDate: null,
        managerId: null,
        staffSignature: null,
        staffSignatureDate: null,
        submittedAt: null
      },
      include: {
        timesheetJobs: {
          include: {
            practice: {
              select: {
                name: true,
                location: true
              }
            },
            branch: {
              select: {
                name: true,
                location: true
              }
            }
          }
        },
        locumProfile: {
          select: {
            fullName: true,
            emailAddress: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Timesheet unlocked successfully. Status changed from ${timesheet.status} to DRAFT.`,
      data: {
        timesheet: updatedTimesheet,
        previousStatus: timesheet.status,
        reason: reason || "Unlocked by authorized user"
      }
    });

  } catch (error) {
    console.error("Unlock timesheet error:", error);
    res.status(500).json({ error: "Failed to unlock timesheet" });
  }
}


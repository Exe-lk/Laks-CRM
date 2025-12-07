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

    const { timesheetJobId, reason } = req.body;

    if (!timesheetJobId) {
      return res.status(400).json({ 
        error: "timesheetJobId is required" 
      });
    }

    // Get the timesheet job
    const timesheetJob = await prisma.timesheetJob.findUnique({
      where: { id: timesheetJobId },
      include: {
        timesheet: {
          include: {
            locumProfile: {
              select: {
                fullName: true,
                emailAddress: true
              }
            }
          }
        },
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
    });

    if (!timesheetJob) {
      return res.status(404).json({ error: "Timesheet job not found" });
    }

    // Check if job is LOCKED or SUBMITTED
    if (timesheetJob.status !== 'LOCKED' && timesheetJob.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: `Job cannot be unlocked. Current status: ${timesheetJob.status}`,
        details: "Only LOCKED or SUBMITTED jobs can be unlocked."
      });
    }

    const previousStatus = timesheetJob.status;

    // Unlock the job by returning it to DRAFT status
    // Clear manager signature and approval data
    const updatedJob = await prisma.timesheetJob.update({
      where: { id: timesheetJobId },
      data: {
        status: 'DRAFT',
        managerSignature: null,
        managerSignatureDate: null,
        managerId: null,
        locumSignature: null,
        locumSignatureDate: null,
        submittedAt: null
      },
      include: {
        timesheet: {
          include: {
            locumProfile: {
              select: {
                fullName: true,
                emailAddress: true
              }
            }
          }
        },
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
    });

    res.status(200).json({
      success: true,
      message: `Job unlocked successfully. Status changed from ${previousStatus} to DRAFT.`,
      data: {
        job: updatedJob,
        previousStatus: previousStatus,
        reason: reason || "Unlocked by authorized user"
      }
    });

  } catch (error) {
    console.error("Unlock timesheet error:", error);
    res.status(500).json({ error: "Failed to unlock timesheet" });
  }
}


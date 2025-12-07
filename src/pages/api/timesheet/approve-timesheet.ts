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

    const { timesheetJobId, managerSignature, managerId, action } = req.body;

    console.log('[APPROVE] Request received:', {
      timesheetJobId,
      hasManagerSignature: !!managerSignature,
      managerId,
      action
    });

    if (!timesheetJobId || !managerSignature || !managerId || !action) {
      console.log('[APPROVE] Missing required fields:', {
        hasTimesheetJobId: !!timesheetJobId,
        hasManagerSignature: !!managerSignature,
        hasManagerId: !!managerId,
        hasAction: !!action
      });
      return res.status(400).json({ 
        error: "timesheetJobId, managerSignature, managerId, and action are required" 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: "Invalid action. Must be 'approve' or 'reject'" 
      });
    }

    // Get the timesheet job with related data
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
            id: true,
            name: true,
            location: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    if (!timesheetJob) {
      return res.status(404).json({ error: "Timesheet job not found" });
    }

    // Verify manager belongs to the practice for this job
    // TODO: Add proper authorization check here to ensure managerId matches practice/branch

    // Check if job is in SUBMITTED status
    if (timesheetJob.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: `Job is not submitted. Current status: ${timesheetJob.status}` 
      });
    }

    let updatedJob;
    let newStatus;

    if (action === 'approve') {
      // Update job with manager signature and lock it
      // Note: Booking is already COMPLETED and payment already charged during timesheet submission
      console.log('[APPROVE] Updating job with manager signature:', {
        jobId: timesheetJobId,
        managerId: managerId
      });
      
      updatedJob = await prisma.timesheetJob.update({
        where: { id: timesheetJobId },
        data: {
          managerSignature: managerSignature,
          managerSignatureDate: new Date(),
          managerId: managerId,
          status: 'LOCKED'
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
      
      console.log('[APPROVE] Job updated successfully:', {
        jobId: updatedJob.id,
        status: updatedJob.status,
        managerId: updatedJob.managerId,
        hasManagerSignature: !!updatedJob.managerSignature,
        managerSignatureDate: updatedJob.managerSignatureDate
      });
      
      newStatus = 'LOCKED';
    } else {
      // Reject and return to DRAFT status
      updatedJob = await prisma.timesheetJob.update({
        where: { id: timesheetJobId },
        data: {
          status: 'DRAFT',
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
      newStatus = 'DRAFT';
    }

    res.status(200).json({
      success: true,
      message: `Job ${action === 'approve' ? 'approved and locked' : 'rejected and returned to draft'}`,
      data: {
        timesheetJobId: updatedJob.id,
        timesheetId: updatedJob.timesheetId,
        status: newStatus,
        managerSignatureDate: action === 'approve' ? updatedJob.managerSignatureDate : null,
        submittedAt: action === 'approve' ? updatedJob.submittedAt : null,
        totalHours: updatedJob.totalHours,
        totalPay: updatedJob.totalPay,
        practice: updatedJob.practice,
        branch: updatedJob.branch,
        locumName: updatedJob.timesheet.locumProfile.fullName
      }
    });

  } catch (error) {
    console.error("Approve timesheet error:", error);
    res.status(500).json({ error: "Failed to process timesheet approval" });
  }
}

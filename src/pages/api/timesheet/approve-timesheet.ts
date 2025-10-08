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

    // Get the timesheet with jobs
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
      include: {
        timesheetJobs: {
          include: {
            practice: true
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

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Check if timesheet is in SUBMITTED status
    if (timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: `Timesheet is not submitted. Current status: ${timesheet.status}` 
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
        month: updatedTimesheet.month,
        year: updatedTimesheet.year,
        locumName: updatedTimesheet.locumProfile.fullName,
        totalJobs: updatedTimesheet.timesheetJobs.length
      }
    });

  } catch (error) {
    console.error("Approve timesheet error:", error);
    res.status(500).json({ error: "Failed to process timesheet approval" });
  }
}

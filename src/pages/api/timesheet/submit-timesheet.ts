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

    // Get the timesheet with jobs
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

    // Check if timesheet is in DRAFT status
    if (timesheet.status !== 'DRAFT') {
      return res.status(400).json({ 
        error: `Timesheet is already ${timesheet.status.toLowerCase()}` 
      });
    }

    // Validate that the job has complete start/end times
    const incompleteJobs = timesheet.timesheetJobs.filter(job => 
      !job.startTime || !job.endTime
    );

    if (incompleteJobs.length > 0) {
      return res.status(400).json({ 
        error: "Job must have complete start and end times before submission",
        incompleteJobsCount: incompleteJobs.length
      });
    }

    // For single-job timesheets, ensure at least one job exists
    if (timesheet.timesheetJobs.length === 0) {
      return res.status(400).json({ 
        error: "Timesheet must have at least one job" 
      });
    }

    // Calculate and update total hours and pay from the job(s)
    const totalHours = timesheet.timesheetJobs.reduce((sum, job) => sum + (job.totalHours || 0), 0);
    const totalPay = timesheet.timesheetJobs.reduce((sum, job) => sum + (job.totalPay || 0), 0);

    // Validate that total hours is greater than 0
    if (totalHours <= 0) {
      return res.status(400).json({ 
        error: "Total hours must be greater than 0" 
      });
    }

    // Update timesheet with staff signature, totals, and change status to SUBMITTED
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        staffSignature: staffSignature,
        staffSignatureDate: new Date(),
        totalHours: totalHours,
        totalPay: totalPay,
        status: 'SUBMITTED',
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

    res.status(200).json({
      success: true,
      message: "Timesheet submitted successfully and is now pending manager approval",
      data: {
        timesheetId: updatedTimesheet.id,
        status: updatedTimesheet.status,
        staffSignatureDate: updatedTimesheet.staffSignatureDate,
        totalHours: updatedTimesheet.totalHours,
        totalPay: updatedTimesheet.totalPay,
        month: updatedTimesheet.month,
        year: updatedTimesheet.year,
        locumName: updatedTimesheet.locumProfile.fullName,
        totalJobs: updatedTimesheet.timesheetJobs.length
      }
    });

  } catch (error) {
    console.error("Submit timesheet error:", error);
    res.status(500).json({ error: "Failed to submit timesheet" });
  }
}

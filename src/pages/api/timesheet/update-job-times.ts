import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
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

    const { 
      timesheetJobId, 
      startTime, 
      endTime, 
      lunchStartTime, 
      lunchEndTime, 
      notes 
    } = req.body;

    if (!timesheetJobId) {
      return res.status(400).json({ error: "timesheetJobId is required" });
    }

    // Get the timesheet job with timesheet info
    const timesheetJob = await prisma.timesheetJob.findUnique({
      where: { id: timesheetJobId },
      include: {
        timesheet: true
      }
    });

    if (!timesheetJob) {
      return res.status(404).json({ error: "Timesheet job not found" });
    }

    // Check if timesheet is locked
    if (timesheetJob.timesheet.status === 'LOCKED') {
      return res.status(403).json({ 
        error: "Cannot modify timesheet job - timesheet is locked" 
      });
    }

    // Build update data
    const updateData: any = {};
    
    if (startTime !== undefined) {
      updateData.startTime = startTime ? new Date(startTime) : null;
    }
    
    if (endTime !== undefined) {
      updateData.endTime = endTime ? new Date(endTime) : null;
    }
    
    if (lunchStartTime !== undefined) {
      updateData.lunchStartTime = lunchStartTime ? new Date(lunchStartTime) : null;
    }
    
    if (lunchEndTime !== undefined) {
      updateData.lunchEndTime = lunchEndTime ? new Date(lunchEndTime) : null;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update the timesheet job
    const updatedJob = await prisma.timesheetJob.update({
      where: { id: timesheetJobId },
      data: updateData
    });

    // Calculate total hours if both start and end times are present
    if (updatedJob.startTime && updatedJob.endTime) {
      let totalHours = 0;
      
      // Calculate work hours
      const workStart = updatedJob.startTime;
      const workEnd = updatedJob.endTime;
      const workDuration = (workEnd.getTime() - workStart.getTime()) / (1000 * 60 * 60);
      
      // Subtract lunch break if both lunch times are present
      if (updatedJob.lunchStartTime && updatedJob.lunchEndTime) {
        const lunchDuration = (updatedJob.lunchEndTime.getTime() - updatedJob.lunchStartTime.getTime()) / (1000 * 60 * 60);
        totalHours = workDuration - lunchDuration;
      } else {
        totalHours = workDuration;
      }
      
      // Calculate total pay
      const totalPay = totalHours * (updatedJob.hourlyRate || 0);
      
      // Update job with calculated hours and pay
      await prisma.timesheetJob.update({
        where: { id: timesheetJobId },
        data: { 
          totalHours: Math.max(0, totalHours),
          totalPay: totalPay
        }
      });
    } else {
      // Reset total hours if times are incomplete
      await prisma.timesheetJob.update({
        where: { id: timesheetJobId },
        data: { 
          totalHours: null,
          totalPay: null
        }
      });
    }

    // Recalculate total hours and pay for the entire timesheet
    const allJobs = await prisma.timesheetJob.findMany({
      where: { timesheetId: timesheetJob.timesheetId }
    });

    const monthTotalHours = allJobs.reduce((sum, job) => {
      return sum + (job.totalHours || 0);
    }, 0);

    const monthTotalPay = allJobs.reduce((sum, job) => {
      return sum + (job.totalPay || 0);
    }, 0);

    // Update timesheet totals
    await prisma.timesheet.update({
      where: { id: timesheetJob.timesheetId },
      data: {
        totalHours: monthTotalHours,
        totalPay: monthTotalPay
      }
    });

    // Get the updated job with all relations
    const finalJob = await prisma.timesheetJob.findUnique({
      where: { id: timesheetJobId },
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
        },
        booking: {
          select: {
            booking_start_time: true,
            booking_end_time: true,
            location: true
          }
        },
        timesheet: {
          select: {
            totalHours: true,
            totalPay: true,
            status: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Job times updated successfully",
      data: {
        job: finalJob,
        monthTotalHours: monthTotalHours,
        monthTotalPay: monthTotalPay
      }
    });

  } catch (error) {
    console.error("Update job times error:", error);
    res.status(500).json({ error: "Failed to update job times" });
  }
}

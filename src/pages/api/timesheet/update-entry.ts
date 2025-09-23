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
      entryId, 
      clockInTime, 
      clockOutTime, 
      lunchStartTime, 
      lunchEndTime, 
      notes 
    } = req.body;

    if (!entryId) {
      return res.status(400).json({ error: "entryId is required" });
    }

    // Get the timesheet entry with its parent timesheet
    const timesheetEntry = await prisma.timesheetEntry.findUnique({
      where: { id: entryId },
      include: {
        timesheet: true
      }
    });

    if (!timesheetEntry) {
      return res.status(404).json({ error: "Timesheet entry not found" });
    }

    // Check if timesheet is locked
    if (timesheetEntry.timesheet.status === 'LOCKED') {
      return res.status(403).json({ 
        error: "Cannot modify timesheet entry - timesheet is locked" 
      });
    }

    // Build update data
    const updateData: any = {};
    
    if (clockInTime !== undefined) {
      updateData.clockInTime = clockInTime ? new Date(clockInTime) : null;
    }
    
    if (clockOutTime !== undefined) {
      updateData.clockOutTime = clockOutTime ? new Date(clockOutTime) : null;
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

    // Update the entry
    const updatedEntry = await prisma.timesheetEntry.update({
      where: { id: entryId },
      data: updateData
    });

    // Recalculate total hours for the day if both clock times are present
    if (updatedEntry.clockInTime && updatedEntry.clockOutTime) {
      let totalHours = 0;
      
      // Calculate work hours
      const workStart = updatedEntry.clockInTime;
      const workEnd = updatedEntry.clockOutTime;
      const workDuration = (workEnd.getTime() - workStart.getTime()) / (1000 * 60 * 60);
      
      // Subtract lunch break if both lunch times are present
      if (updatedEntry.lunchStartTime && updatedEntry.lunchEndTime) {
        const lunchDuration = (updatedEntry.lunchEndTime.getTime() - updatedEntry.lunchStartTime.getTime()) / (1000 * 60 * 60);
        totalHours = workDuration - lunchDuration;
      } else {
        totalHours = workDuration;
      }
      
      // Update entry with calculated hours
      await prisma.timesheetEntry.update({
        where: { id: entryId },
        data: { totalHours: Math.max(0, totalHours) }
      });
    } else {
      // Reset total hours if clock times are incomplete
      await prisma.timesheetEntry.update({
        where: { id: entryId },
        data: { totalHours: null }
      });
    }

    // Recalculate total hours for the week
    const allEntries = await prisma.timesheetEntry.findMany({
      where: { timesheetId: timesheetEntry.timesheetId }
    });

    const weekTotalHours = allEntries.reduce((sum, entry) => {
      return sum + (entry.totalHours || 0);
    }, 0);

    const totalPay = weekTotalHours * (timesheetEntry.timesheet.hourlyRate || 0);

    // Update timesheet totals
    await prisma.timesheet.update({
      where: { id: timesheetEntry.timesheetId },
      data: {
        totalHours: weekTotalHours,
        totalPay: totalPay
      }
    });

    // Get the updated entry with timesheet info
    const finalEntry = await prisma.timesheetEntry.findUnique({
      where: { id: entryId },
      include: {
        timesheet: {
          select: {
            id: true,
            totalHours: true,
            totalPay: true,
            status: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Timesheet entry updated successfully",
      data: {
        entry: finalEntry,
        weekTotalHours: weekTotalHours,
        weekTotalPay: totalPay
      }
    });

  } catch (error) {
    console.error("Update timesheet entry error:", error);
    res.status(500).json({ error: "Failed to update timesheet entry" });
  }
}

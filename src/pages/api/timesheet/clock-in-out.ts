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

    const { locumId, practiceId, branchId, action, date, time, notes } = req.body;

    if (!locumId || !practiceId || !action || !date) {
      return res.status(400).json({ 
        error: "locumId, practiceId, action, and date are required" 
      });
    }

    if (!['clock-in', 'clock-out', 'lunch-start', 'lunch-end'].includes(action)) {
      return res.status(400).json({ 
        error: "Invalid action. Must be 'clock-in', 'clock-out', 'lunch-start', or 'lunch-end'" 
      });
    }

    // Verify locum exists and is associated with the practice
    const locumProfile = await prisma.locumProfile.findUnique({
      where: { id: locumId },
      include: {
        bookings: {
          where: {
            practice_id: practiceId,
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!locumProfile) {
      return res.status(404).json({ error: "Locum profile not found" });
    }

    // Check if locum has confirmed bookings with this practice
    if (locumProfile.bookings.length === 0) {
      return res.status(403).json({ 
        error: "No confirmed bookings found with this practice" 
      });
    }

    // Get or create timesheet for the current week
    const entryDate = new Date(date);
    const weekStart = new Date(entryDate);
    weekStart.setDate(entryDate.getDate() - entryDate.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    let timesheet = await prisma.timesheet.findUnique({
      where: {
        locum_week_branch_unique: {
          locumId: locumId,
          weekStartDate: weekStart,
          branchId: branchId || null
        }
      },
      include: {
        timesheetEntries: true
      }
    });

    if (!timesheet) {
      // Create new timesheet for the week (created by locum)
      timesheet = await prisma.timesheet.create({
        data: {
          locumId: locumId,
          practiceId: practiceId,
          branchId: branchId || null,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          status: 'DRAFT',
          hourlyRate: locumProfile.hourlyPayRate || 0,
          createdBy: 'LOCUM' // Locum creates the timesheet
        },
        include: {
          timesheetEntries: true
        }
      });
    }

    // Check if timesheet is locked
    if (timesheet.status === 'LOCKED') {
      return res.status(403).json({ 
        error: "Timesheet is locked and cannot be modified" 
      });
    }

    // Find or create timesheet entry for the specific date
    const entryDateOnly = new Date(entryDate);
    entryDateOnly.setHours(0, 0, 0, 0);

    let timesheetEntry = await prisma.timesheetEntry.findFirst({
      where: {
        timesheetId: timesheet.id,
        date: entryDateOnly
      }
    });

    if (!timesheetEntry) {
      timesheetEntry = await prisma.timesheetEntry.create({
        data: {
          timesheetId: timesheet.id,
          date: entryDateOnly,
          notes: notes || null
        }
      });
    }

    // Update the appropriate time field
    const clockTime = time ? new Date(`${date}T${time}`) : new Date();
    
    const updateData: any = {};
    
    switch (action) {
      case 'clock-in':
        if (timesheetEntry.clockInTime) {
          return res.status(400).json({ 
            error: "Already clocked in for this date" 
          });
        }
        updateData.clockInTime = clockTime;
        break;
        
      case 'clock-out':
        if (!timesheetEntry.clockInTime) {
          return res.status(400).json({ 
            error: "Must clock in before clocking out" 
          });
        }
        if (timesheetEntry.clockOutTime) {
          return res.status(400).json({ 
            error: "Already clocked out for this date" 
          });
        }
        updateData.clockOutTime = clockTime;
        break;
        
      case 'lunch-start':
        if (!timesheetEntry.clockInTime) {
          return res.status(400).json({ 
            error: "Must clock in before starting lunch" 
          });
        }
        if (timesheetEntry.lunchStartTime) {
          return res.status(400).json({ 
            error: "Lunch already started for this date" 
          });
        }
        updateData.lunchStartTime = clockTime;
        break;
        
      case 'lunch-end':
        if (!timesheetEntry.lunchStartTime) {
          return res.status(400).json({ 
            error: "Must start lunch before ending lunch" 
          });
        }
        if (timesheetEntry.lunchEndTime) {
          return res.status(400).json({ 
            error: "Lunch already ended for this date" 
          });
        }
        updateData.lunchEndTime = clockTime;
        break;
    }

    // Update the timesheet entry
    const updatedEntry = await prisma.timesheetEntry.update({
      where: { id: timesheetEntry.id },
      data: updateData
    });

    // Calculate total hours for the day if clock-out is completed
    if (action === 'clock-out' && updatedEntry.clockInTime && updatedEntry.clockOutTime) {
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
        where: { id: updatedEntry.id },
        data: { totalHours: Math.max(0, totalHours) }
      });
    }

    // Recalculate total hours for the week
    const allEntries = await prisma.timesheetEntry.findMany({
      where: { timesheetId: timesheet.id }
    });

    const weekTotalHours = allEntries.reduce((sum, entry) => {
      return sum + (entry.totalHours || 0);
    }, 0);

    const totalPay = weekTotalHours * (timesheet.hourlyRate || 0);

    // Update timesheet totals
    await prisma.timesheet.update({
      where: { id: timesheet.id },
      data: {
        totalHours: weekTotalHours,
        totalPay: totalPay
      }
    });

    res.status(200).json({
      success: true,
      message: `${action} recorded successfully`,
      data: {
        timesheetId: timesheet.id,
        entryId: updatedEntry.id,
        action: action,
        time: clockTime,
        totalHours: weekTotalHours,
        totalPay: totalPay
      }
    });

  } catch (error) {
    console.error("Clock in/out error:", error);
    res.status(500).json({ error: "Failed to record clock in/out" });
  }
}

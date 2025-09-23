import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
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

    const { entryId } = req.query;

    if (!entryId) {
      return res.status(400).json({ error: "entryId is required" });
    }

    // Get the timesheet entry with its parent timesheet
    const timesheetEntry = await prisma.timesheetEntry.findUnique({
      where: { id: entryId as string },
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
        error: "Cannot delete timesheet entry - timesheet is locked" 
      });
    }

    // Delete the entry
    await prisma.timesheetEntry.delete({
      where: { id: entryId as string }
    });

    // Recalculate total hours for the week
    const remainingEntries = await prisma.timesheetEntry.findMany({
      where: { timesheetId: timesheetEntry.timesheetId }
    });

    const weekTotalHours = remainingEntries.reduce((sum, entry) => {
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

    res.status(200).json({
      success: true,
      message: "Timesheet entry deleted successfully",
      data: {
        deletedEntryId: entryId,
        weekTotalHours: weekTotalHours,
        weekTotalPay: totalPay,
        remainingEntries: remainingEntries.length
      }
    });

  } catch (error) {
    console.error("Delete timesheet entry error:", error);
    res.status(500).json({ error: "Failed to delete timesheet entry" });
  }
}

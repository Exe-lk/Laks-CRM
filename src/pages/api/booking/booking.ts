// src/pages/api/booking/booking.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get bookings
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

      const { locum_id, practice_id, page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let whereClause: any = {};
      
      if (locum_id) {
        whereClause.locum_id = locum_id as string;
      }
      
      if (practice_id) {
        whereClause.practice_id = practice_id as string;
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          locumProfile: {
            select: {
              fullName: true,
              contactNumber: true,
              location: true
            }
          },
          practice: {
            select: {
              name: true,
              telephone: true,
              location: true
            }
          },
          request: {
            select: {
              request_id: true,
              status: true
            }
          }
        },
        orderBy: [
          { booking_date: 'desc' },
          { booking_start_time: 'desc' }
        ],
        skip: offset,
        take: limitNum
      });

      const totalBookings = await prisma.booking.count({
        where: whereClause
      });

      res.status(200).json({
        success: true,
        data: {
          bookings,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalBookings,
            total_pages: Math.ceil(totalBookings / limitNum)
          }
        }
      });

    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }

  } else if (req.method === 'PUT') {
    // Update booking (cancel, etc.)
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
        booking_id,
        status,
        cancel_by,
        cancel_time,
        description
      } = req.body;

      if (!booking_id) {
        return res.status(400).json({ error: "Booking ID required" });
      }

      const updateData: any = {};

      if (status) updateData.status = status;
      if (cancel_by) updateData.cancel_by = cancel_by;
      if (cancel_time) updateData.cancel_time = new Date(cancel_time);
      if (description !== undefined) updateData.description = description;

      const booking = await prisma.booking.update({
        where: { booking_id },
        data: updateData,
        include: {
          locumProfile: {
            select: {
              fullName: true,
              contactNumber: true
            }
          },
          practice: {
            select: {
              name: true,
              telephone: true
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        data: booking,
        message: "Booking updated successfully"
      });

    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }

  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
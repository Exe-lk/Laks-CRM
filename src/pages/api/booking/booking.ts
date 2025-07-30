import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create booking
    try {
      // --- Auth Validation for Booking API ---
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }
  
      const token = authHeader.split(" ")[1]; // Bearer <token>
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);
  
      if (userError || !user) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
      }

      // --- Booking creation ---
      const {
        locum_id,
        practice_id,
        booking_date,
        booking_start_time,
        booking_end_time,
        status,
        location,
        description,
      } = req.body;
  
      if (!locum_id || !practice_id || !booking_date) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const booking = await prisma.booking.create({
        data: {
          locum_id,
          practice_id,
          booking_date: new Date(booking_date),
          booking_start_time,
          booking_end_time,
          status,
          location,
          description,
        },
      });
  
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking Error:", error);
      res.status(500).json({ error: "Failed to create booking", details: error });
    }
  } else if (req.method === 'PUT') {
    // Edit booking
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }
  
      const token = authHeader.split(" ")[1]; // Bearer <token>
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);
  
      if (userError || !user) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
      }
      const {
        booking_id,
        status,
        description,
        accept_time,
        cancel_by,
        cancel_time
      } = req.body;

      const booking = await prisma.booking.update({
        where: { booking_id },
        data: {
          status: status || null,
          description: description || null,
          accept_time: accept_time ? new Date(accept_time) : null,
          cancel_by: cancel_by || null,
          cancel_time: cancel_time ? new Date(cancel_time) : null,
        },
      });

      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update booking', details: error });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

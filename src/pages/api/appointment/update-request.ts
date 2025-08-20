import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";
import { cancelAutoCancellation, scheduleAutoCancellation } from '@/lib/autoCancelManager';

const prisma = new PrismaClient();

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
      request_id,
      practice_id,
      request_date,
      request_start_time,
      request_end_time,
      location,
      required_role
    } = req.body;

    if (!request_id || !practice_id) {
      return res.status(400).json({ error: "Request ID and Practice ID are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingRequest = await tx.appointmentRequest.findUnique({
        where: { request_id },
        include: {
          responses: true,
          confirmations: true,
          booking: true
        }
      });

      if (!existingRequest) {
        throw new Error("Appointment request not found");
      }

      if (existingRequest.practice_id !== practice_id) {
        throw new Error("You can only update your own appointment requests");
      }

      if (existingRequest.status !== 'PENDING') {
        throw new Error("Only pending requests can be updated");
      }

      if (existingRequest.booking) {
        throw new Error("Cannot update request with confirmed booking");
      }

      const activeConfirmations = existingRequest.confirmations.filter(
        conf => conf.status === 'PRACTICE_CONFIRMED'
      );

      if (activeConfirmations.length > 0) {
        throw new Error("Cannot update request with active confirmations pending");
      }

      cancelAutoCancellation(request_id);

      const updateData: any = {};
      let newRequestDate = existingRequest.request_date;
      
      if (request_date) {
        const requestDate = new Date(request_date);
        if (requestDate < new Date()) {
          throw new Error("Request date must be in the future");
        }
        updateData.request_date = requestDate;
        newRequestDate = requestDate;
      }
      if (request_start_time) updateData.request_start_time = request_start_time;
      if (request_end_time) updateData.request_end_time = request_end_time;
      if (location) updateData.location = location;
      if (required_role) updateData.required_role = required_role;

      if (required_role && required_role !== existingRequest.required_role) {
        await tx.appointmentResponse.deleteMany({
          where: { request_id }
        });
      }

      const updatedRequest = await tx.appointmentRequest.update({
        where: { request_id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          practice: {
            select: {
              name: true,
              location: true
            }
          }
        }
      });

      const hasAcceptedApplications = existingRequest.responses.some(response => response.status === 'ACCEPTED');
      const roleChanged = required_role && required_role !== existingRequest.required_role;
      
      const now = new Date();
      const timeDiff = (newRequestDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (timeDiff < 24 && (!hasAcceptedApplications || roleChanged)) {
        const startTime = updateData.request_start_time || existingRequest.request_start_time;
        scheduleAutoCancellation(request_id, now, newRequestDate, startTime);
        console.log(`Rescheduled auto-cancellation for updated appointment request: ${request_id}`);
      }

      return updatedRequest;
    });

    res.status(200).json({
      success: true,
      data: result,
      message: "Appointment request updated successfully"
    });

  } catch (error) {
    console.error("Update appointment request error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update appointment request" });
  }
}
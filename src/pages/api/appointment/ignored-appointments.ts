import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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

    const { locum_id, page = 1, limit = 20 } = req.query;

    if (!locum_id) {
      return res.status(400).json({ error: "Locum ID is required" });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get ignored appointments for the locum
    const ignoredAppointments = await prisma.ignoredAppointment.findMany({
      where: {
        locum_id: locum_id as string
      },
      include: {
        request: {
          select: {
            request_id: true,
            location: true,
            address: true,
            request_date: true,
            request_start_time: true,
            request_end_time: true,
            required_role: true,
            status: true,
            practice: {
              select: {
                id: true,
                name: true,
                location: true,
                address: true,
                telephone: true
              }
            },
            branch: {
              select: {
                id: true,
                name: true,
                address: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: {
        ignored_at: 'desc'
      },
      skip,
      take: limitNum
    });

    // Get total count for pagination
    const totalCount = await prisma.ignoredAppointment.count({
      where: {
        locum_id: locum_id as string
      }
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: ignoredAppointments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error("Get ignored appointments error:", error);
    res.status(500).json({ error: "Failed to get ignored appointments" });
  }
}

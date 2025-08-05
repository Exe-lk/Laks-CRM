// src/pages/api/appointment/practice-requests.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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

    const { practice_id, page = 1, limit = 20 } = req.query;

    if (!practice_id) {
      return res.status(400).json({ error: "Practice ID required" });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const requests = await prisma.appointmentRequest.findMany({
      where: {
        practice_id: practice_id as string
      },
      include: {
        responses: {
          where: {
            status: 'ACCEPTED'
          },
          select: {
            response_id: true,
            responded_at: true,
            locumProfile: {
              select: {
                fullName: true,
                location: true
              }
            }
          }
        },
        confirmations: {
          where: {
            status: {
              in: ['PRACTICE_CONFIRMED', 'LOCUM_CONFIRMED', 'LOCUM_REJECTED']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            chosenLocum: {
              select: {
                fullName: true
              }
            }
          }
        },
        booking: {
          select: {
            booking_id: true,
            status: true
          }
        },
        _count: {
          select: {
            responses: {
              where: {
                status: 'ACCEPTED'
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip: offset,
      take: limitNum
    });

    const totalRequests = await prisma.appointmentRequest.count({
      where: {
        practice_id: practice_id as string
      }
    });

    const formattedRequests = requests.map(request => {
      const latestConfirmation = request.confirmations[0];
      
      return {
        request_id: request.request_id,
        request_date: request.request_date,
        request_start_time: request.request_start_time,
        request_end_time: request.request_end_time,
        location: request.location,
        status: request.status,
        total_applicants: request._count.responses,
        latest_applicants: request.responses.slice(0, 3).map(response => ({
          locum_name: response.locumProfile.fullName,
          responded_at: response.responded_at
        })),
        current_selection: latestConfirmation ? {
          confirmation_id: latestConfirmation.confirmation_id,
          chosen_locum: latestConfirmation.chosenLocum.fullName,
          status: latestConfirmation.status,
          practice_confirmed_at: latestConfirmation.practice_confirmed_at,
          expires_at: latestConfirmation.expires_at
        } : null,
        booking_created: !!request.booking,
        can_select_applicant: request.status === "PENDING" && !latestConfirmation,
        created_at: request.createdAt,
        updated_at: request.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: {
        requests: formattedRequests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalRequests,
          total_pages: Math.ceil(totalRequests / limitNum)
        }
      }
    });

  } catch (error) {
    console.error("Practice requests error:", error);
    res.status(500).json({ error: "Failed to fetch practice requests" });
  }
}
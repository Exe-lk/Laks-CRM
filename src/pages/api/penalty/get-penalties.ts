import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";
import { applyCors } from '@/lib/api-cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(applyCors(req, res)) return;
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

    // Query parameters for filtering
    const { 
      status,           // PENDING, CHARGED, DISMISSED
      cancelledPartyId,
      cancelledPartyType, // locum or practice
      limit = '50',
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (cancelledPartyId && typeof cancelledPartyId === 'string') {
      where.cancelledPartyId = cancelledPartyId;
    }

    if (cancelledPartyType && typeof cancelledPartyType === 'string') {
      where.cancelledPartyType = cancelledPartyType;
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (typeof sortBy === 'string') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    // Fetch penalties with pagination and relations
    const [penalties, totalCount] = await Promise.all([
      prisma.cancellationPenalty.findMany({
        where,
        orderBy,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        include: {
          booking: {
            select: {
              id: true,
              bookingUniqueid: true,
              booking_date: true,
              booking_start_time: true,
              booking_end_time: true,
              location: true,
              status: true
            }
          },
          chargedLocum: {
            select: {
              id: true,
              fullName: true,
              emailAddress: true,
              contactNumber: true,
              hourlyPayRate: true,
              location: true
            }
          },
          chargedPractice: {
            select: {
              id: true,
              name: true,
              email: true,
              telephone: true,
              address: true,
              location: true,
              stripeCustomer: {
                select: {
                  stripeCustomerId: true,
                  email: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.cancellationPenalty.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        penalties,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: totalCount > parseInt(offset as string) + penalties.length
        }
      }
    });

  } catch (error) {
    console.error("Get penalties error:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch penalties" });
  }
}


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

    const { locum_id } = req.query;

    if (!locum_id) {
      return res.status(400).json({ error: "Locum ID required" });
    }

    console.log('Looking for locum with ID:', locum_id);

   
    const locumProfile = await prisma.locumProfile.findUnique({
      where: { id: locum_id as string },
      select: { employeeType: true }
    });

    console.log('Found locum profile:', locumProfile);

    if (!locumProfile || !locumProfile.employeeType) {
      return res.status(404).json({ error: "Locum profile not found or employee type not specified" });
    }

    const availableJobs = await prisma.appointmentRequest.findMany({
      where: {
        status: 'PENDING',
        required_role: locumProfile.employeeType, 
        request_date: {
          gte: new Date()
        },
        NOT: {
          responses: {
            some: {
              locum_id: locum_id as string
            }
          }
        }
      },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
            location: true,
            address: true,
            telephone: true
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found appointment requests:', availableJobs.length);
    console.log('First few requests:', availableJobs.slice(0, 2));

    // Filter out jobs that conflict with existing bookings
    const locumBookings = await prisma.booking.findMany({
      where: {
        locum_id: locum_id as string,
        status: 'CONFIRMED',
        booking_date: {
          gte: new Date()
        }
      },
      select: {
        booking_date: true,
        booking_start_time: true,
        booking_end_time: true
      }
    });

    const availableNonConflictingJobs = availableJobs.filter(job => {
      return !locumBookings.some(booking => {
        const jobDate = job.request_date.toDateString();
        const bookingDate = booking.booking_date.toDateString();
        
        if (jobDate !== bookingDate) return false;
        
        return !(job.request_end_time <= booking.booking_start_time || 
                job.request_start_time >= booking.booking_end_time);
      });
    });

    const enhancedJobs = availableNonConflictingJobs.map(job => ({
      ...job,
      applicants_count: job._count.responses,
      time_until_appointment: Math.floor((job.request_date.getTime() - new Date().getTime()) / (1000 * 60 * 60)), // hours
      is_urgent: job.request_date.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 // less than 24 hours
    }));

    console.log('Final enhanced jobs to return:', enhancedJobs.length);
    console.log('Enhanced jobs:', enhancedJobs);

    res.status(200).json({
      success: true,
      data: enhancedJobs,
      total: enhancedJobs.length
    });

  } catch (error) {
    console.error("Get available jobs error:", error);
    res.status(500).json({ error: "Failed to get available jobs" });
  }
}
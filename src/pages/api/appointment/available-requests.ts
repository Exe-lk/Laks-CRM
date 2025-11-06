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

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const availableJobs = await prisma.appointmentRequest.findMany({
      where: {
        status: 'PENDING',
        required_role: locumProfile.employeeType, 
        request_date: {
          gte: currentDate
        },
        NOT: {
          OR: [
            {
              responses: {
                some: {
                  locum_id: locum_id as string
                }
              }
            },
            {
              ignoredBy: {
                some: {
                  locum_id: locum_id as string
                }
              }
            }
          ]
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
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            location: true
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

    const now = new Date();
    const futureJobs = availableJobs.filter(job => {
      const appointmentDateTime = new Date(job.request_date);
      const [hours, minutes] = job.request_start_time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return appointmentDateTime > now;
    });

    console.log('Jobs with future start times:', futureJobs.length);

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

    console.log('Found locum bookings:', locumBookings.length);
    console.log('Locum bookings:', locumBookings);

    // Helper function to convert time string to minutes for comparison
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const availableNonConflictingJobs = futureJobs.filter(job => {
      const jobStartMinutes = timeToMinutes(job.request_start_time);
      const jobEndMinutes = timeToMinutes(job.request_end_time);
      
      const hasConflict = locumBookings.some(booking => {
        const jobDate = job.request_date.toDateString();
        const bookingDate = booking.booking_date.toDateString();
        
        if (jobDate !== bookingDate) return false;
        
        const bookingStartMinutes = timeToMinutes(booking.booking_start_time);
        const bookingEndMinutes = timeToMinutes(booking.booking_end_time);
        
        // Check if times overlap: job overlaps if it doesn't end before booking starts AND doesn't start after booking ends
        const overlaps = !(jobEndMinutes <= bookingStartMinutes || jobStartMinutes >= bookingEndMinutes);
        
        if (overlaps) {
          console.log(`Conflict detected: Job ${job.request_id} (${job.request_start_time}-${job.request_end_time}) conflicts with booking (${booking.booking_start_time}-${booking.booking_end_time})`);
        }
        
        return overlaps;
      });
      
      return !hasConflict;
    });

    console.log('Jobs after conflict filtering:', availableNonConflictingJobs.length);

    const enhancedJobs = availableNonConflictingJobs.map(job => {
      // Calculate full appointment datetime (date + start time)
      const appointmentDateTime = new Date(job.request_date);
      const [hours, minutes] = job.request_start_time.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const timeUntilAppointment = appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = Math.floor(timeUntilAppointment / (1000 * 60 * 60));
      const isUrgent = timeUntilAppointment < 24 * 60 * 60 * 1000; // less than 24 hours
      
      return {
        ...job,
        applicants_count: job._count.responses,
        time_until_appointment: hoursUntilAppointment,
        is_urgent: isUrgent
      };
    });

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
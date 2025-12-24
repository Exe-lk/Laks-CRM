import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Fetch timesheet jobs where showRatingRemark is true and both rating and remark exist
    const timesheetJobs = await prisma.timesheetJob.findMany({
      where: {
        showRatingRemark: true,
        rating: {
          not: null,
        },
        remark: {
          not: null,
        },
      },
      include: {
        booking: {
          include: {
            locumProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        practice: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the review slider format
    const reviews = timesheetJobs.map((job) => {
      const locumName = job.booking?.locumProfile?.fullName || 'Anonymous';
      const practiceName = job.practice?.name || 'Practice';
      const initial = locumName.charAt(0).toUpperCase();

      // Generate a color gradient based on the job ID (consistent for same job)
      const colors = [
        'from-purple-400 to-pink-400',
        'from-blue-400 to-cyan-400',
        'from-green-400 to-emerald-400',
        'from-orange-400 to-red-400',
        'from-pink-400 to-rose-400',
        'from-indigo-400 to-purple-400',
        'from-teal-400 to-cyan-400',
        'from-amber-400 to-orange-400',
        'from-violet-400 to-purple-400',
      ];
      const colorIndex = parseInt(job.id.slice(-1), 16) % colors.length;
      const color = colors[colorIndex];

      return {
        id: job.id,
        name: locumName,
        practiceName: practiceName,
        initial: initial,
        text: job.remark || '',
        rating: Math.round(job.rating || 5),
        color: color,
        createdAt: job.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
}


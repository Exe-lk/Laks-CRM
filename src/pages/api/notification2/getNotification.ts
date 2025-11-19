import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { applyCors } from "@/lib/api-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { locumId, practiceId, branchId, status, page = "1", limit = "20" } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = Math.min(parseInt(limit as string, 10) || 20, 100); // Max 100 items per page
    const skip = Math.max(0, (pageNumber - 1) * limitNumber);

    const where: any = {};

    if (locumId) {
      where.locumId = locumId as string;
    }

    if (practiceId) {
      where.practiceId = practiceId as string;
    }

    if (branchId) {
      where.branchId = branchId as string;
    }

    if (status) {
      where.status = status as string;
    }

    const totalCount = await prisma.notification.count({
      where,
    });

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        locumProfile: {
          select: {
            id: true,
            fullName: true,
            emailAddress: true,
          },
        },
        practice: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNumber,
    });

    const totalPages = Math.ceil(totalCount / limitNumber);

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCount,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error: any) {
    console.error("Get Notifications Error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}


import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "Notification ID is required",
      });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
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
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error("Get Notification By ID Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}


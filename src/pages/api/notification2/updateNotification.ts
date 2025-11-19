import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { applyCors } from "@/lib/api-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id, status } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "Notification ID is required",
      });
    }

    if (!status || !["UNREAD", "READ"].includes(status)) {
      return res.status(400).json({
        error: "Status must be either UNREAD or READ",
      });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { status },
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

    return res.status(200).json({
      success: true,
      data: notification,
      message: "Notification updated successfully",
    });
  } catch (error: any) {
    console.error("Update Notification Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}


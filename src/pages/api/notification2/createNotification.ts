import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { locumId, practiceId, branchId, message, status = "UNREAD" } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!locumId && !practiceId && !branchId) {
      return res.status(400).json({
        error: "At least one of locumId, practiceId, or branchId is required",
      });
    }

    if (locumId) {
      const locum = await prisma.locumProfile.findUnique({
        where: { id: locumId },
      });
      if (!locum) {
        return res.status(404).json({
          error: "Locum not found",
        });
      }
    }

    if (practiceId) {
      const practice = await prisma.practice.findUnique({
        where: { id: practiceId },
      });
      if (!practice) {
        return res.status(404).json({
          error: "Practice not found",
        });
      }
    }

    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) {
        return res.status(404).json({
          error: "Branch not found",
        });
      }
    }

    if (status && !["UNREAD", "READ", "PENDING"].includes(status)) {
      return res.status(400).json({
        error: "Status must be either UNREAD, READ, or PENDING",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        locumId: locumId || null,
        practiceId: practiceId || null,
        branchId: branchId || null,
        message,
        status,
      },
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

    return res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (error: any) {
    console.error("Create Notification Error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}


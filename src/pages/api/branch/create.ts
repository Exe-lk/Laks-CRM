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
    const {
      name,
      address,
      location,
      telephone,
      email,
      practiceId,
      status = "active"
    } = req.body;

    if (!name || !address || !location || !practiceId) {
      return res.status(400).json({
        error: "Missing required fields: name, address, location, practiceId",
      });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: practiceId }
    });

    if (!practice) {
      return res.status(404).json({
        error: "Practice not found",
      });
    }

    if (practice.practiceType !== "Corporate") {
      return res.status(403).json({
        error: "Only Corporate practices can create branches",
      });
    }

    const newBranch = await prisma.branch.create({
      data: {
        name,
        address,
        location,
        telephone,
        email,
        practiceId,
        status,
      },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return res.status(201).json({
      branch: newBranch,
      message: "Branch created successfully",
    });

  } catch (error: any) {
    console.error("Branch Create Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
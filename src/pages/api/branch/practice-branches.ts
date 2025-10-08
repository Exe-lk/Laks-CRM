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
    const { practiceId } = req.query;

    if (!practiceId || typeof practiceId !== "string") {
      return res.status(400).json({ 
        error: "Practice ID is required" 
      });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      select: { id: true, name: true }
    });

    if (!practice) {
      return res.status(404).json({
        error: "Practice not found",
      });
    }

    const branches = await prisma.branch.findMany({
      where: { practiceId },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      branches,
      practice,
      count: branches.length,
    });

  } catch (error: any) {
    console.error("Practice Branches Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
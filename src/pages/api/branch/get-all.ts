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
    const { practiceId, status } = req.query;

    const whereClause: any = {};
    
    if (practiceId) {
      whereClause.practiceId = practiceId as string;
    }
    
    if (status) {
      whereClause.status = status as string;
    }

    const branches = await prisma.branch.findMany({
      where: whereClause,
      include: {
        practice: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      branches,
      count: branches.length,
    });

  } catch (error: any) {
    console.error("Branch Get All Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
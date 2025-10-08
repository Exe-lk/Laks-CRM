import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: "Branch ID is required" 
      });
    }

    const existingBranch = await prisma.branch.findUnique({
      where: { id }
    });

    if (!existingBranch) {
      return res.status(404).json({
        error: "Branch not found",
      });
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: updateData,
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return res.status(200).json({
      branch: updatedBranch,
      message: "Branch updated successfully",
    });

  } catch (error: any) {
    console.error("Branch Update Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
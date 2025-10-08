import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id } = req.body;

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

    await prisma.branch.delete({
      where: { id },
    });

    return res.status(200).json({ 
      message: "Branch deleted successfully",
      deletedBranch: {
        id: existingBranch.id,
        name: existingBranch.name,
      },
    });

  } catch (error: any) {
    console.error("Branch Delete Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
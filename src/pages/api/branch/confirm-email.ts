import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "PUT":
        const { email, status } = req.body;

        if (!email || !status) {
          return res.status(400).json({ error: "Email and status are required" });
        }

        // Find the branch by email
        const branch = await prisma.branch.findFirst({
          where: { email },
        });

        if (!branch) {
          return res.status(404).json({ error: "Branch not found" });
        }

        // If already has the target status, return success (idempotent)
        if (branch.status === status) {
          return res.status(200).json({
            ...branch,
            message: "Status already set",
          });
        }

        // Update branch status
        const updatedBranch = await prisma.branch.update({
          where: { id: branch.id },
          data: { status },
        });

        return res.status(200).json(updatedBranch);

      default:
        res.setHeader("Allow", ["PUT"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Branch confirm-email error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Email address already exists",
      });
    }

    if (error.code === "P1001") {
      return res.status(500).json({
        error: `Database connection error: ${
          error.message || "Unable to connect to database"
        }`,
      });
    }

    if (error.message && error.message.includes("supabase")) {
      return res.status(500).json({
        error: `Supabase error: ${error.message}`,
      });
    }

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}


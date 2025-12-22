import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if it's a locum
    const locum = await prisma.locumProfile.findUnique({
      where: { emailAddress: email },
    });

    if (locum) {
      return res.status(200).json({ userType: "locum" });
    }

    // Check if it's a practice
    const practice = await prisma.practice.findUnique({
      where: { email: email },
    });

    if (practice) {
      return res.status(200).json({ userType: "practice" });
    }

    // Check if it's a branch
    const branch = await prisma.branch.findFirst({
      where: { email: email },
    });

    if (branch) {
      return res.status(200).json({ userType: "branch" });
    }

    return res.status(404).json({ error: "User not found" });
  } catch (error: any) {
    console.error("Error checking user type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


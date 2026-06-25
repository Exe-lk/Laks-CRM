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

    const normalizedEmail = email.trim().toLowerCase();

    const locum = await prisma.locumProfile.findFirst({
      where: {
        emailAddress: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (locum) {
      return res.status(200).json({ userType: "locum" });
    }

    const practice = await prisma.practice.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (practice) {
      return res.status(200).json({ userType: "practice" });
    }

    const branch = await prisma.branch.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (branch) {
      return res.status(200).json({ userType: "branch" });
    }

    return res.status(404).json({ error: "User not found" });
  } catch (error: unknown) {
    console.error("Error checking user type:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

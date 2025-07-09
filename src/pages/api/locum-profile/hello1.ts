// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        try {
           // Get all locum profiles
        const profiles = await prisma.locumProfile.findMany({
          include: {
            specialties: true,
          },
          orderBy: { createdAt: "desc" },
        });
          return res.status(200).json({
            message:"data",
            payload:profiles
          });
        } catch (error) {
          console.error("Error fetching profiles:", error);
          return res.status(500).json({ error: "Failed to fetch profiles" });
        }
    }
  } catch (error: any) {
    return res.status(400).json({
      error: "Email address already exists",
    });
  }
}

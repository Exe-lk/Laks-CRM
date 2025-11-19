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

        const updatedProfile = await prisma.locumProfile.update({
          where: { emailAddress: email },
          data: { status },
        });

        return res.status(200).json(updatedProfile);

     
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
   

    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Email address or mobile number already exists",
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
      error: error,
      
    });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { notifyAdminNewRegistration, sendRegistrationEmailSafely } from "@/lib/registrationNotificationEmails";


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

        // First, check if the profile exists
        const existingProfile = await prisma.practice.findUnique({
          where: { email },
        });

        if (!existingProfile) {
          return res.status(404).json({ error: "Profile not found" });
        }

        // If already verified, return success (idempotent)
        if (existingProfile.status === status || existingProfile.status === 'verify') {
          return res.status(200).json({
            ...existingProfile,
            message: "Email already verified",
          });
        }

        await sendRegistrationEmailSafely("practice/confirm-email", () =>
          notifyAdminNewRegistration({
            userType: "practice",
            name: existingProfile.name,
            email: existingProfile.email,
            roleOrPracticeType: existingProfile.practiceType,
          })
        );

        // Update the status
        const updatedProfile = await prisma.practice.update({
          where: { email },
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

    const message =
      typeof error?.message === "string"
        ? error.message
        : error != null
          ? String(error)
          : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

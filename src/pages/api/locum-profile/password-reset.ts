import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST":
        // Send password reset email
        const { email } = req.body;

        // Basic validation
        if (!email) {
          return res.status(400).json({
            error: "Email address is required",
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            error: "Invalid email format",
          });
        }

        // Send password reset email using Supabase
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
        });

        if (error) {
          console.error("Password reset error:", error);
          return res.status(400).json({
            error: `Failed to send password reset email: ${error.message}`,
          });
        }

        return res.status(200).json({
          message: "Password reset email sent successfully",
          data: data,
        });

      default:
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Password reset API Error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

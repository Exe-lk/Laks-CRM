import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "POST":
        // Update user password
        const { password } = req.body;

        // Basic validation
        if (!password) {
          return res.status(400).json({
            error: "New password is required",
          });
        }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
          return res.status(400).json({
            error: "Password must be at least 6 characters long",
          });
        }
console.log("password", password)
        // Update user password using Supabase
        const { data, error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          console.error("Password update error:", error);
          return res.status(400).json({
            error: `Failed to update password: ${error.message}`,
          });
        }

        return res.status(200).json({
          message: "Password updated successfully",
          data: data,
        });

      default:
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Password update API Error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
} 
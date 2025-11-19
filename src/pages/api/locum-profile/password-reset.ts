import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { applyCors } from "@/lib/api-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  try {
    switch (req.method) {
      case "POST":
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            error: "Email address is required",
          });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            error: "Invalid email format",
          });
        }

        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          return res.status(500).json({ error: "Failed to check user existence" });
        }
        const userExists = users.users.some((user) => user.email === email);
        if (!userExists) {
          return res.status(404).json({ error: "Email is not registered" });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/resetPassword`,
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

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Find the branch in our database
    const branch = await prisma.branch.findUnique({
      where: { email },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
            email: true,
            telephone: true,
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({
        error: "Branch not found",
      });
    }

    if (branch.status !== "active") {
      return res.status(403).json({
        error: "Branch account is not active",
      });
    }

    // Create a profile object for the branch
    const branchProfile = {
      id: branch.id,
      name: branch.name,
      email: branch.email,
      address: branch.address,
      location: branch.location,
      telephone: branch.telephone,
      practiceId: branch.practiceId,
      practiceName: branch.practice?.name || "Unknown Practice",
      practiceType: "Branch",
      status: branch.status,
      userType: "branch",
    };

    return res.status(200).json({
      message: "Login successful",
      profile: branchProfile,
      accessToken: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token,
      session: authData.session,
    });

  } catch (error: any) {
    console.error("Branch Login Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

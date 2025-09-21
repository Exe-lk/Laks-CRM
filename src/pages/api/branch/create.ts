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
    const {
      name,
      address,
      location,
      telephone,
      email,
      password,
      practiceId,
      status = "active"
    } = req.body;

    if (!name || !address || !location || !email || !password || !practiceId) {
      return res.status(400).json({
        error: "Missing required fields: name, address, location, email, password, practiceId",
      });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: practiceId }
    });

    if (!practice) {
      return res.status(404).json({
        error: "Practice not found",
      });
    }

    if (practice.practiceType !== "Corporate") {
      return res.status(403).json({
        error: "Only Corporate practices can create branches",
      });
    }

    // Check if branch email already exists
    const existingBranch = await prisma.branch.findFirst({
      where: { email }
    });

    if (existingBranch) {
      return res.status(400).json({
        error: "Branch with this email already exists",
      });
    }

    // Create authentication user in Supabase
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${siteUrl}/branch/verifyEmail`,
      },
    });

    if (authError) {
      return res.status(400).json({
        error: `Authentication error: ${authError.message}`,
      });
    }

    const newBranch = await prisma.branch.create({
      data: {
        name,
        address,
        location,
        telephone,
        email,
        password,
        practiceId,
        status,
      },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Create a profile object for the branch
    const branchProfile = {
      id: newBranch.id,
      name: newBranch.name,
      email: newBranch.email,
      address: newBranch.address,
      location: newBranch.location,
      telephone: newBranch.telephone,
      practiceId: newBranch.practiceId,
      practiceName: newBranch.practice?.name || "Unknown Practice",
      practiceType: "Branch",
      status: newBranch.status,
      userType: "branch",
    };

    return res.status(201).json({
      branch: newBranch,
      profile: branchProfile,
      authUser: authData.user,
      message: "Branch created successfully",
    });

  } catch (error: any) {
    console.error("Branch Create Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
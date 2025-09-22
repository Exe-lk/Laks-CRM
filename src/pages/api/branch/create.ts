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

    console.log('Branch creation request data:', {
      name,
      address,
      location,
      telephone,
      email: email ? `"${email}"` : 'undefined',
      password: password ? '[REDACTED]' : 'undefined',
      practiceId,
      status
    });

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

    // Check if branch email already exists in database
    const existingBranch = await prisma.branch.findFirst({
      where: { email: email.trim() }
    });

    if (existingBranch) {
      return res.status(400).json({
        error: "Branch with this email already exists in database",
      });
    }

    // Check if email already exists in Supabase auth
    try {
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError && existingUsers) {
        const emailExists = existingUsers.users.some(user => user.email === email.trim());
        if (emailExists) {
          return res.status(400).json({
            error: "Email address already exists in authentication system",
          });
        }
      }
    } catch (authCheckError) {
      console.log('Could not check existing auth users:', authCheckError);
      // Continue anyway - this is just a precautionary check
    }

    // Validate email format before sending to Supabase
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      console.log('Email validation failed:', email);
      return res.status(400).json({
        error: `Invalid email format: ${email}`,
      });
    }

    // Create authentication user in Supabase
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    console.log('Attempting Supabase auth signup with:', {
      email: email.trim(),
      siteUrl,
      redirectTo: `${siteUrl}/branch/verifyEmail`
    });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: `${siteUrl}/branch/verifyEmail`,
      },
    });

    if (authError) {
      console.log('Supabase auth error:', authError);
      
      // Handle specific Supabase error cases
      if (authError.message.includes('already registered')) {
        return res.status(400).json({
          error: "Email address is already registered. Please use a different email.",
        });
      }
      
      if (authError.message.includes('invalid email')) {
        return res.status(400).json({
          error: "Invalid email format. Please check the email address.",
        });
      }
      
      if (authError.message.includes('weak password')) {
        return res.status(400).json({
          error: "Password is too weak. Please use a stronger password.",
        });
      }
      
      return res.status(400).json({
        error: `Authentication error: ${authError.message}`,
      });
    }

    console.log('Supabase auth success:', { userId: authData.user?.id });

    const newBranch = await prisma.branch.create({
      data: {
        name,
        address,
        location,
        telephone: telephone || null,
        email: email.trim(),
        // password: password, // Temporarily removed due to schema sync issue
        practiceId,
        status,
      },
      // include: {
      //   practice: {
      //     select: {
      //       id: true,
      //       name: true,
      //     }
      //   }
      // }
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
      practiceName: "Branch", // newBranch.practice?.name || "Unknown Practice",
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
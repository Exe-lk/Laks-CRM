// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { getSpecialityValue, getSpecialityDisplayName } from "@/lib/enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        // Get all locum profiles
        const profiles = await prisma.practice.findMany({
          orderBy: { createdAt: "desc" },
        });
        // Map specialties to use display names

        return res.status(200).json(profiles);

      case "POST":
        const formatDate = (input: string) => {
          const [day, month, year] = input.split("-");
          return `${year}-${month}-${day}`; // ISO format
        };
        // Create a new locum profile
        const {
              dob,
              email,
              GDCnumber,
              name,
              telephone,
              address,
              location,
              password
          // Array of specialty objects
        } = req.body;

        // Basic validation
        if (
          !name ||
          !email ||
          !password
        ) {
          return res.status(400).json({
            error:
              "Missing required fields: fullName, emailAddress, contactNumber, address, password, gdcNumber, employeeType",
          });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: email,
            password: password,
            options: {
              emailRedirectTo: `https://laks-crm.netlify.app/`,
            },
          }
        );

        if (authError) {
          return res.status(400).json({
            error: `Authentication error: ${authError.message}`,
          });
        }

        // Create locum profile and specialties in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create locum profile
          const newProfile = await tx.practice.create({
            data: {
              dob: new Date(dob.split("-").reverse().join("-")).toISOString(),
              email,
              GDCnumber,
              name,
              telephone,
              address,
              location,
              status: "pending",
            },
          });

          return { profile: newProfile };
        });

        return res.status(201).json({
          profile: result.profile,
          authUser: authData.user,
          status: 200,
        });

      case "PUT":
        // Update a locum profile
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Profile ID is required" });
        }

        const updatedProfile = await prisma.locumProfile.update({
          where: { id },
          data: {
            ...updateData,
            dateOfBirth: updateData.dateOfBirth
              ? new Date(updateData.dateOfBirth)
              : undefined,
          },
        });

        return res.status(200).json(updatedProfile);

      case "DELETE":
        // Delete a locum profile
        const profileId = req.query.id as string;

        if (!profileId) {
          return res.status(400).json({ error: "Profile ID is required" });
        }

        await prisma.locumProfile.delete({
          where: { id: profileId },
        });

        return res
          .status(200)
          .json({ message: "Profile deleted successfully" });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Email address or mobile number already exists",
      });
    }

    // Handle database connection errors
    if (error.code === "P1001") {
      return res.status(500).json({
        error: `Database connection error: ${
          error.message || "Unable to connect to database"
        }`,
      });
    }

    // Handle Supabase auth errors
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

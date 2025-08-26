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
        const profiles = await prisma.practice.findMany({
          orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(profiles);

      case "POST":
        const formatDate = (input: string) => {
          const [day, month, year] = input.split("-");
          return `${year}-${month}-${day}`; 
        };
        const {
              dob,
              email,
              GDCnumber,
              name,
              telephone,
              address,
              location,
              password
        } = req.body;

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

        // Check for existing user with same email or telephone BEFORE creating authentication
        const existingUserByEmail = await prisma.practice.findUnique({
          where: { email: email }
        });

        if (existingUserByEmail) {
          return res.status(400).json({
            error: "Email address already exists",
          });
        }

        const existingUserByPhone = await prisma.practice.findUnique({
          where: { telephone: telephone }
        });

        if (existingUserByPhone) {
          return res.status(400).json({
            error: "Phone number already exists",
          });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: email,
            password: password,
            options: {
              emailRedirectTo: `${siteUrl}/practiceUser/verifyEmail`,
            },
          }
        );

        if (authError) {
          return res.status(400).json({
            error: `Authentication error: ${authError.message}`,
          });
        }

        const result = await prisma.$transaction(async (tx) => {
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
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Profile ID is required" });
        }

        const updatedProfile = await prisma.practice.update({
          where: { id },
          data: {
            ...updateData,
            dob : updateData.dob 
              ? new Date(updateData.dob)
              : undefined,
          },
        });

        return res.status(200).json(updatedProfile);

      case "DELETE":
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
    if (error.code === "P2002") {
      // This should now rarely happen since we check for duplicates before auth creation
      return res.status(400).json({
        error: "Email address or phone number already exists",
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

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { Speciality, SPECIALITY_VALUES, getSpecialityValue } from "@/lib/enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        // Get all locum profiles
        const profiles = await prisma.locumProfile.findMany({
          include: {
            specialties: true,
          },
          orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(profiles);

      case "POST":
        // Create a new locum profile
        const {
          fullName,
          emailAddress,
          contactNumber,
          address,
          password,
          gdcNumber,
          employeeType,
          software,
          specialties, // Array of specialty objects
        } = req.body;

        // Basic validation
        if (
          !fullName ||
          !emailAddress ||
          !contactNumber ||
          !address ||
          !password ||
          !employeeType
        ) {
          return res.status(400).json({
            error:
              "Missing required fields: fullName, emailAddress, contactNumber, address, password, gdcNumber, employeeType",
          });
        }
        // Validate each specialty object
        if (specialties) {
          for (const specialty of specialties) {
            if (!specialty.speciality || !specialty.numberOfYears) {
              return res.status(400).json({
                error:
                  "Each specialty must have speciality and numberOfYears fields",
              });
            }
            if (
              typeof specialty.numberOfYears !== "number" ||
              specialty.numberOfYears < 0
            ) {
              return res.status(400).json({
                error: "numberOfYears must be a positive number",
              });
            }
            // Validate speciality value and convert to numeric enum
            const specialityValue = getSpecialityValue(specialty.speciality);
            if (specialityValue === null) {
              return res.status(400).json({
                error: `ff`,
              });
            }
            // Replace the display name with numeric value
            specialty.speciality = specialityValue;
          }
        }
        // Create user in Supabase Auth
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: emailAddress,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
            },
          });

        if (authError) {
          return res.status(400).json({
            error: `Authentication error: ${authError.message}`,
          });
        }

        // Create locum profile and specialties in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create locum profile
          const newProfile = await tx.locumProfile.create({
            data: {
              fullName,
              emailAddress,
              contactNumber,
              address,
              gdcNumber,
              employeeType,
              dateOfBirth: new Date("1990-01-01"), // Default date, you may want to handle this differently
              location: "", // Default empty string
              software: software || "",
              status: "pending",
              role: "user",
              referenceNumber: `REF-${Date.now()}`,
            },
          });

          // Create specialties if provided
          let createdSpecialties = [];
          if (specialties && specialties.length > 0) {
            for (const specialty of specialties) {
              const createdSpecialty = await tx.specialty.create({
                data: {
                  locumId: newProfile.id,
                  speciality: specialty.speciality,
                  numberOfYears: specialty.numberOfYears,
                },
              });
              createdSpecialties.push(createdSpecialty);
            }
          }

          return { profile: newProfile, specialties: createdSpecialties };
        });

        return res.status(201).json({
          profile: result.profile,
          specialties: result.specialties,
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
    console.error("API Error:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Email address already exists",
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
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

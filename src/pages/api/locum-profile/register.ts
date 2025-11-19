import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { getSpecialityValue,getSpecialityDisplayName } from "@/lib/enums";
import { applyCors } from "@/lib/api-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  try {
    switch (req.method) {
      case "GET":
        const profiles = await prisma.locumProfile.findMany({
          include: {
            specialties: true,
          },
          orderBy: { createdAt: "desc" },
        });
        const profilesWithDisplayNames = profiles.map(profile => ({
          ...profile,
          specialties: profile.specialties.map(specialty => ({
            ...specialty,
            speciality: getSpecialityDisplayName(specialty.speciality)
          }))
        }));
        return res.status(200).json(profilesWithDisplayNames);

      case "POST":
        const {
          fullName,
          emailAddress,
          contactNumber,
          address,
          location,
          password,
          gdcNumber,
          employeeType,
          software,
          specialties, 
        } = req.body;

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

        // Check for existing user with same email or contact number BEFORE creating authentication
        const existingUserByEmail = await prisma.locumProfile.findUnique({
          where: { emailAddress: emailAddress }
        });

        if (existingUserByEmail) {
          return res.status(400).json({
            error: "Email address already exists",
          });
        }

        const existingUserByPhone = await prisma.locumProfile.findUnique({
          where: { contactNumber: contactNumber }
        });

        if (existingUserByPhone) {
          return res.status(400).json({
            error: "Phone number already exists",
          });
        }

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
            const specialityValue = getSpecialityValue(specialty.speciality);
            if (specialityValue === null) {
              return res.status(400).json({
                error: `ff`,
              });
            }
            specialty.speciality = specialityValue;
          }
        }
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
        const { data: authData, error: authError } =
          await supabase.auth.signUp({
            email: emailAddress,
            password: password,
            options: {
              emailRedirectTo: `${siteUrl}/locumStaff/verifyEmail`
            }
          });

        if (authError) {
          return res.status(400).json({
            error: `Authentication error: ${authError.message}`,
          });
        }

        const result = await prisma.$transaction(async (tx) => {
          const newProfile = await tx.locumProfile.create({
            data: {
              fullName,
              emailAddress,
              contactNumber,
              address,
              gdcNumber,
              employeeType,
              dateOfBirth: new Date("1990-01-01"), 
              location, 
              software: software || "",
              status: "pending",
              role: "user",

            },
          });

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

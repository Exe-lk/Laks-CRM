import { getSpecialityDisplayName } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { count } from "console";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
    if(req.method !== "GET"){
        return res.status(405).json({message:"Method not allowed"})
    }

    try {
         const locums = await prisma.locumProfile.findMany({
      select: {
        id: true,
        fullName: true,
        location: true,
        employeeType: true,
        role: true,
        status: true,
        averageRating: true,
        totalRatings: true,
        specialties: {
          select: {
            speciality: true,
            numberOfYears: true,
          },
        },
      },
      where: {
        status: "accept", 
      },
      orderBy: { averageRating: "desc" }, 
    });

    const locumWithDisplayNames = locums.map(locum =>({
        ...locum,
        specialties: locum.specialties.map(speciality =>({
            ...speciality,
            speciality: getSpecialityDisplayName(speciality.speciality)
        }))
    }));

    return res.status(200).json({
        success:true,
        data:locumWithDisplayNames,
        count:locumWithDisplayNames.length
    })
    } catch (error) {
        console.error("Error fetching locums:", error);
        return res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch locum profiles"
        });
    }
}
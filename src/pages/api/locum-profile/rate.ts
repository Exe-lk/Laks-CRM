import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { applyCors } from "@/lib/api-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { locumId, practiceId, rating } = req.body;
    if (!locumId || !practiceId || rating === undefined) {
      return res.status(400).json({
        error: "Missing required fields: locumId, practiceId, rating"
      });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be a number between 1 and 5"
      });
    }
    const locum = await prisma.locumProfile.findUnique({
      where: { id: locumId }
    });

    if (!locum) {
      return res.status(404).json({ error: "Locum not found" });
    }

    const practice = await prisma.practice.findUnique({
      where: { id: practiceId }
    });

    if (!practice) {
      return res.status(404).json({ error: "Practice not found" });
    }

    const currentRatings = locum.ratings ? (locum.ratings as any[]) : [];

    const existingRatingIndex = currentRatings.findIndex(
      (r: any) => r.userId === practiceId && r.userType === "PRACTICE"
    );

    const newRating = {
      userId: practiceId,
      userType: "PRACTICE",
      rating: rating,
      createdAt: new Date().toISOString()
    };

    let updatedRatings;
    if (existingRatingIndex >= 0) {

      updatedRatings = [...currentRatings];
      updatedRatings[existingRatingIndex] = newRating;
    } else {
   
      updatedRatings = [...currentRatings, newRating];
    }


    const totalRatings = updatedRatings.length;
    const averageRating = updatedRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings;

    const updatedLocum = await prisma.locumProfile.update({
      where: { id: locumId },
      data: {
        ratings: updatedRatings,
        averageRating: Math.round(averageRating * 10) / 10, 
        totalRatings: totalRatings
      }
    });

    return res.status(200).json({
      success: true,
      message: existingRatingIndex >= 0 ? "Rating updated successfully" : "Rating added successfully",
      data: {
        locumId: updatedLocum.id,
        averageRating: updatedLocum.averageRating,
        totalRatings: updatedLocum.totalRatings,
        yourRating: rating
      }
    });

  } catch (error) {
    console.error("Error rating locum:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to rate locum"
    });
  }
}
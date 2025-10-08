import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: "Card ID is required" 
      });
    }

    // Find existing card
    const existingCard = await (prisma as any).paymentCard.findUnique({
      where: { id },
      include: {
        practice: {
          select: { id: true, name: true }
        }
      }
    });

    if (!existingCard) {
      return res.status(404).json({
        error: "Card not found",
      });
    }

    // Soft delete - mark as inactive instead of hard delete for audit purposes
    const deletedCard = await (prisma as any).paymentCard.update({
      where: { id },
      data: { 
        status: "inactive",
        isDefault: false // Remove default status when deleting
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

    // If this was the default card, check if there are other active cards and make one default
    if (existingCard.isDefault) {
      const remainingCards = await (prisma as any).paymentCard.findMany({
        where: {
          practiceId: existingCard.practiceId,
          status: "active",
          id: { not: id }
        },
        orderBy: { createdAt: "asc" },
        take: 1
      });

      // Make the oldest remaining card the default
      if (remainingCards.length > 0) {
        await (prisma as any).paymentCard.update({
          where: { id: remainingCards[0].id },
          data: { isDefault: true }
        });
      }
    }

    return res.status(200).json({
      message: "Card deleted successfully",
      cardId: id
    });

  } catch (error: any) {
    console.error("Card Delete Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

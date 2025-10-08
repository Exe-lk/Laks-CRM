import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { practiceId } = req.query;

    if (!practiceId || typeof practiceId !== "string") {
      return res.status(400).json({ 
        error: "Practice ID is required" 
      });
    }

    // Verify practice exists
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      select: { id: true, name: true }
    });

    if (!practice) {
      return res.status(404).json({
        error: "Practice not found",
      });
    }

    // Get all cards for the practice
    const cards = await (prisma as any).paymentCard.findMany({
      where: { 
        practiceId,
        status: "active" // Only return active cards
      },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { isDefault: "desc" }, // Default cards first
        { createdAt: "desc" }   // Then by creation date
      ],
    });

    // Return cards without sensitive data but with masked card numbers
    const safeCards = cards.map((card: any) => {
      const { cardNumber, expiryMonth, expiryYear, cvv, ...safeCardData } = card;
      
      return {
        ...safeCardData,
        maskedCardNumber: `**** **** **** ${card.lastFourDigits}`,
        expiryDisplay: "**/**" // Keep expiry hidden for security
      };
    });

    return res.status(200).json({
      cards: safeCards,
      practice,
      count: safeCards.length,
    });

  } catch (error: any) {
    console.error("Practice Cards Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

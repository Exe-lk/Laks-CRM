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
    const { status = "active" } = req.query;

    // Get all cards (admin endpoint - should be protected in real implementation)
    const cards = await (prisma as any).paymentCard.findMany({
      where: status ? { status: status as string } : {},
      include: {
        practice: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { practice: { name: "asc" } },
        { isDefault: "desc" },
        { createdAt: "desc" }
      ],
    });

    // Return cards without sensitive data
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
      count: safeCards.length,
    });

  } catch (error: any) {
    console.error("Get All Cards Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

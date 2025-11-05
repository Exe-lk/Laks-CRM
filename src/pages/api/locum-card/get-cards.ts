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
    const { locumId } = req.query;

    if (!locumId || typeof locumId !== "string") {
      return res.status(400).json({
        error: "Missing or invalid locumId parameter",
      });
    }

    // Validate locum exists
    const locum = await prisma.locumProfile.findUnique({
      where: { id: locumId }
    });

    if (!locum) {
      return res.status(404).json({
        error: "Locum not found",
      });
    }

    // Fetch all active cards for this locum
    const cards = await prisma.locumPaymentCard.findMany({
      where: {
        locumId,
        status: "active"
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        locumId: true,
        cardHolderName: true,
        lastFourDigits: true,
        cardType: true,
        isDefault: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        locumProfile: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    });

    // Format cards with masked number
    const formattedCards = cards.map(card => ({
      ...card,
      maskedCardNumber: `**** **** **** ${card.lastFourDigits}`
    }));

    return res.status(200).json({
      cards: formattedCards,
      count: formattedCards.length
    });

  } catch (error: any) {
    console.error("Locum Get Cards Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}


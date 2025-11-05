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
    const { branchId } = req.query;

    if (!branchId || typeof branchId !== "string") {
      return res.status(400).json({
        error: "Missing or invalid branchId parameter",
      });
    }

    // Validate branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      return res.status(404).json({
        error: "Branch not found",
      });
    }

    // Fetch all active cards for this branch
    const cards = await prisma.branchPaymentCard.findMany({
      where: {
        branchId,
        status: "active"
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        branchId: true,
        cardHolderName: true,
        lastFourDigits: true,
        cardType: true,
        isDefault: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
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
    console.error("Branch Get Cards Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}


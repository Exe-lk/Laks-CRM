import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { 
  encryptCardData, 
  validateCardNumber, 
  validateExpiryDate, 
  validateCVV, 
  detectCardType 
} from "@/lib/cardEncryption";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const {
      practiceId,
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardType,
      isDefault = false
    } = req.body;

    // Validate required fields
    if (!practiceId || !cardHolderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({
        error: "Missing required fields: practiceId, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv",
      });
    }

    // Validate practice exists
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId }
    });

    if (!practice) {
      return res.status(404).json({
        error: "Practice not found",
      });
    }

    // Clean card number (remove spaces)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    // Validate card data
    if (!validateCardNumber(cleanCardNumber)) {
      return res.status(400).json({
        error: "Invalid card number",
      });
    }

    if (!validateExpiryDate(expiryMonth, expiryYear)) {
      return res.status(400).json({
        error: "Invalid expiry date",
      });
    }

    // Auto-detect card type if not provided
    const detectedCardType = cardType || detectCardType(cleanCardNumber);

    if (!validateCVV(cvv, detectedCardType)) {
      return res.status(400).json({
        error: "Invalid CVV",
      });
    }

    // Encrypt sensitive card data
    const encryptedCardData = encryptCardData({
      cardNumber: cleanCardNumber,
      expiryMonth,
      expiryYear,
      cvv
    });

    // If this is set as default, remove default from other cards
    if (isDefault) {
      await (prisma as any).paymentCard.updateMany({
        where: { 
          practiceId,
          status: "active"
        },
        data: { isDefault: false }
      });
    }

    // Create new card
    const newCard = await (prisma as any).paymentCard.create({
      data: {
        practiceId,
        cardHolderName,
        cardNumber: encryptedCardData.cardNumber,
        lastFourDigits: cleanCardNumber.slice(-4),
        expiryMonth: encryptedCardData.expiryMonth,
        expiryYear: encryptedCardData.expiryYear,
        cvv: encryptedCardData.cvv,
        cardType: detectedCardType,
        isDefault,
        status: "active"
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

    // Return card without sensitive data
    const { cardNumber: _, expiryMonth: __, expiryYear: ___, cvv: ____, ...safeCardData } = newCard;

    return res.status(201).json({
      card: {
        ...safeCardData,
        maskedCardNumber: `**** **** **** ${newCard.lastFourDigits}`,
        expiryDisplay: `${expiryMonth}/${expiryYear.slice(-2)}`
      },
      message: "Card added successfully",
    });

  } catch (error: any) {
    console.error("Card Create Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

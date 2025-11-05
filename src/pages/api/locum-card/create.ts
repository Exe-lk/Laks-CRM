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
      locumId,
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardType,
      isDefault = false
    } = req.body;

    // Validate required fields
    if (!locumId || !cardHolderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({
        error: "Missing required fields: locumId, cardHolderName, cardNumber, expiryMonth, expiryYear, cvv",
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

    // Clean card number (remove spaces)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    // Validate card
    const cardValidation = validateCardNumber(cleanCardNumber);
    if (!cardValidation.isValid) {
      return res.status(400).json({
        error: "Invalid card number",
        details: cardValidation.error
      });
    }

    const expiryValidation = validateExpiryDate(expiryMonth, expiryYear);
    if (!expiryValidation.isValid) {
      return res.status(400).json({
        error: "Invalid expiry date",
        details: expiryValidation.error
      });
    }

    const cvvValidation = validateCVV(cvv);
    if (!cvvValidation.isValid) {
      return res.status(400).json({
        error: "Invalid CVV",
        details: cvvValidation.error
      });
    }

    // Detect card type
    const detectedCardType = detectCardType(cleanCardNumber);

    // Encrypt sensitive data
    const encryptedCardData = encryptCardData({
      cardNumber: cleanCardNumber,
      expiryMonth,
      expiryYear,
      cvv
    });

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.locumPaymentCard.updateMany({
        where: { locumId, status: "active" },
        data: { isDefault: false }
      });
    }

    // Create new card
    const newCard = await prisma.locumPaymentCard.create({
      data: {
        locumId,
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
        locumProfile: {
          select: {
            id: true,
            fullName: true,
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
    console.error("Locum Card Create Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}


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
  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { 
      id, 
      cardHolderName, 
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      cardType, 
      isDefault,
      status 
    } = req.body;

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

    // Prepare update data
    let updateData: any = {};

    // Update card holder name if provided
    if (cardHolderName !== undefined) {
      updateData.cardHolderName = cardHolderName;
    }

    // Update status if provided
    if (status !== undefined) {
      updateData.status = status;
    }

    // If card details are being updated
    if (cardNumber || expiryMonth || expiryYear || cvv) {
      // For security, require all card details when updating any sensitive field
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
        return res.status(400).json({
          error: "When updating card details, all fields are required: cardNumber, expiryMonth, expiryYear, cvv"
        });
      }

      // Clean card number (remove spaces)
      const cleanCardNumber = cardNumber.replace(/\s/g, '');

      // Validate card data
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

      // Auto-detect card type if not provided
      const detectedCardType = cardType || detectCardType(cleanCardNumber);

      const cvvValidation = validateCVV(cvv, detectedCardType);
      if (!cvvValidation.isValid) {
        return res.status(400).json({
          error: "Invalid CVV",
          details: cvvValidation.error
        });
      }

      // Encrypt sensitive card data
      const encryptedCardData = encryptCardData({
        cardNumber: cleanCardNumber,
        expiryMonth,
        expiryYear,
        cvv
      });

      updateData = {
        ...updateData,
        cardNumber: encryptedCardData.cardNumber,
        lastFourDigits: cleanCardNumber.slice(-4),
        expiryMonth: encryptedCardData.expiryMonth,
        expiryYear: encryptedCardData.expiryYear,
        cvv: encryptedCardData.cvv,
        cardType: detectedCardType
      };
    }

    // Handle default card setting
    if (isDefault !== undefined) {
      updateData.isDefault = isDefault;
      
      // If setting as default, remove default from other cards
      if (isDefault) {
        await (prisma as any).paymentCard.updateMany({
          where: { 
            practiceId: existingCard.practiceId,
            status: "active",
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }
    }

    // Update the card
    const updatedCard = await (prisma as any).paymentCard.update({
      where: { id },
      data: updateData,
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
    const { cardNumber: _, expiryMonth: __, expiryYear: ___, cvv: ____, ...safeCardData } = updatedCard;

    return res.status(200).json({
      card: {
        ...safeCardData,
        maskedCardNumber: `**** **** **** ${updatedCard.lastFourDigits}`,
        expiryDisplay: (expiryMonth && expiryYear) ? `${expiryMonth}/${expiryYear.slice(-2)}` : undefined
      },
      message: "Card updated successfully",
    });

  } catch (error: any) {
    console.error("Card Update Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

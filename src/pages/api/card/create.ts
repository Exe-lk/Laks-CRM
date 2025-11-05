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

    console.log('Card validation debug:', {
      originalCardNumber: cardNumber,
      cleanCardNumber: cleanCardNumber,
      length: cleanCardNumber.length,
      isNumeric: /^\d+$/.test(cleanCardNumber)
    });

    // Test Luhn algorithm step by step
    console.log('Testing Luhn algorithm for:', cleanCardNumber);
    let sum = 0;
    let isEven = false;
    let debugSteps = [];
    
    for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCardNumber.charAt(i));
      let originalDigit = digit;
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      debugSteps.push({
        position: i,
        originalDigit,
        processedDigit: digit,
        isEven,
        runningSum: sum
      });
      isEven = !isEven;
    }
    
    console.log('Luhn steps:', debugSteps);
    console.log('Final sum:', sum, 'Sum % 10:', sum % 10, 'Valid:', sum % 10 === 0);

    // Validate card data
    const cardValidation = validateCardNumber(cleanCardNumber);
    if (!cardValidation.isValid) {
      console.error('Card validation failed for:', {
        cardNumber: cleanCardNumber,
        length: cleanCardNumber.length,
        error: cardValidation.error
      });
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

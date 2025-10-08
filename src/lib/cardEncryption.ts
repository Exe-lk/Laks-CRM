import CryptoJS from 'crypto-js';

// Use environment variable for encryption key - should be added to .env
const ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY || 'your-secret-key-here';

if (!process.env.CARD_ENCRYPTION_KEY) {
  console.warn('Warning: CARD_ENCRYPTION_KEY not found in environment variables. Using default key.');
}

export interface CardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface EncryptedCardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

/**
 * Encrypts sensitive card data
 */
export function encryptCardData(cardData: CardData): EncryptedCardData {
  try {
    return {
      cardNumber: CryptoJS.AES.encrypt(cardData.cardNumber, ENCRYPTION_KEY).toString(),
      expiryMonth: CryptoJS.AES.encrypt(cardData.expiryMonth, ENCRYPTION_KEY).toString(),
      expiryYear: CryptoJS.AES.encrypt(cardData.expiryYear, ENCRYPTION_KEY).toString(),
      cvv: CryptoJS.AES.encrypt(cardData.cvv, ENCRYPTION_KEY).toString(),
    };
  } catch (error) {
    throw new Error('Failed to encrypt card data');
  }
}

/**
 * Decrypts sensitive card data
 */
export function decryptCardData(encryptedCardData: EncryptedCardData): CardData {
  try {
    return {
      cardNumber: CryptoJS.AES.decrypt(encryptedCardData.cardNumber, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
      expiryMonth: CryptoJS.AES.decrypt(encryptedCardData.expiryMonth, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
      expiryYear: CryptoJS.AES.decrypt(encryptedCardData.expiryYear, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
      cvv: CryptoJS.AES.decrypt(encryptedCardData.cvv, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
    };
  } catch (error) {
    throw new Error('Failed to decrypt card data');
  }
}

/**
 * Masks card number for display (shows only last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length < 4) return cardNumber;
  return '**** **** **** ' + cardNumber.slice(-4);
}

/**
 * Validates card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCardNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detects card type based on card number
 */
export function detectCardType(cardNumber: string): 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'UNKNOWN' {
  const cleanCardNumber = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleanCardNumber)) {
    return 'VISA';
  } else if (/^5[1-5]/.test(cleanCardNumber) || /^2[2-7]/.test(cleanCardNumber)) {
    return 'MASTERCARD';
  } else if (/^3[47]/.test(cleanCardNumber)) {
    return 'AMEX';
  } else if (/^6/.test(cleanCardNumber)) {
    return 'DISCOVER';
  }

  return 'UNKNOWN';
}

/**
 * Validates expiry date
 */
export function validateExpiryDate(month: string, year: string): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month);
  const expYear = parseInt(year);

  if (expMonth < 1 || expMonth > 12) {
    return false;
  }

  // For 2-digit year, assume 20xx
  const fullYear = expYear < 100 ? 2000 + expYear : expYear;

  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && expMonth < currentMonth) {
    return false;
  }

  return true;
}

/**
 * Validates CVV
 */
export function validateCVV(cvv: string, cardType: string): boolean {
  if (cardType === 'AMEX') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
}

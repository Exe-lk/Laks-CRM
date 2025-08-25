export interface BookingIdParams {
  practiceId: string;
  locumId: string;
  bookingDate: Date;
  bookingStartTime: string;
  location?: string;
}

function generateShortCode(id: string, prefix: string): string {
  if (id.length <= 5) {
    return `${prefix}${id.toUpperCase()}`;
  }
  const firstTwo = id.substring(0, 2).toUpperCase();
  const lastThree = id.substring(id.length - 3).toUpperCase();
  return `${prefix}${firstTwo}${lastThree}`;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatTimeForId(timeString: string): string {
  return timeString.replace(/:/g, '');
}

export function generateBookingId(params: BookingIdParams): string {
  const { practiceId, locumId, bookingDate, bookingStartTime, location } = params;
  
  const dateStr = bookingDate.toISOString().split('T')[0].replace(/-/g, '');
  
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  
  const practiceCode = generateShortCode(practiceId, 'PR');
  const locumCode = generateShortCode(locumId, 'LC');
  
  const randomSuffix = generateRandomString(4);
  
  const bookingId = `BK-${dateStr}-${timeStr}-${practiceCode}-${locumCode}-${randomSuffix}`;
  
  return bookingId;
}

export function generateShortBookingId(params: BookingIdParams): string {
  const { practiceId, locumId, bookingDate } = params;
  
  const dateStr = bookingDate.toISOString().split('T')[0].replace(/-/g, '');
  
  const now = new Date();
  const timeStr = now.toTimeString().substring(0, 5).replace(':', '');
  
  const practiceChar = practiceId.charAt(0).toUpperCase();
  const locumChar = locumId.charAt(0).toUpperCase();
  const practiceLastChar = practiceId.charAt(practiceId.length - 1).toUpperCase();
  const locumLastChar = locumId.charAt(locumId.length - 1).toUpperCase();
  const randomChar = generateRandomString(1);
  
  const combinedCode = `${practiceChar}${locumChar}${practiceLastChar}${locumLastChar}${randomChar}`;
  
  return `BK-${dateStr}-${timeStr}-${combinedCode}`;
}

export function isValidBookingId(bookingId: string): boolean {
  const fullFormatRegex = /^BK-\d{8}-\d{6}-PR[A-Z0-9]{5}-LC[A-Z0-9]{5}-[A-Z0-9]{4}$/;
  
  const shortFormatRegex = /^BK-\d{8}-\d{4}-[A-Z0-9]{5}$/;
  
  return fullFormatRegex.test(bookingId) || shortFormatRegex.test(bookingId);
}

export function parseBookingId(bookingId: string): {
  isValid: boolean;
  date?: string;
  time?: string;
  format?: 'full' | 'short';
} {
  if (!isValidBookingId(bookingId)) {
    return { isValid: false };
  }
  
  const parts = bookingId.split('-');
  
  if (parts.length === 6) {
    return {
      isValid: true,
      date: parts[1],
      time: parts[2],
      format: 'full'
    };
  } else if (parts.length === 4) {
    return {
      isValid: true,
      date: parts[1],
      time: parts[2],
      format: 'short'
    };
  }
  
  return { isValid: false };
}

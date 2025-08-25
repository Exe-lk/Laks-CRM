# Booking ID Generation System

## Overview

This document describes the new unique booking ID generation system implemented for the Laks-CRM application. The system replaces the previous random CUID generation with a meaningful, date-time-based ID that contains useful information about the booking.

## Booking ID Format

### Full Format
```
BK-YYYYMMDD-HHMMSS-PRXXXXX-LCXXXXX-XXXX
```

**Example:** `BK-20241220-143015-PRCL001-LCZX789-A2F3`

**Components:**
- `BK` - Fixed prefix indicating "Booking"
- `YYYYMMDD` - Booking date (20241220 = December 20, 2024)
- `HHMMSS` - Creation timestamp (143015 = 14:30:15)
- `PRXXXXX` - Practice code (first 2 + last 3 chars of practice ID)
- `LCXXXXX` - Locum code (first 2 + last 3 chars of locum ID)
- `XXXX` - Random suffix for uniqueness

### Short Format (Alternative)
```
BK-YYYYMMDD-HHMM-XXXXX
```

**Example:** `BK-20241220-1430-CZ789`

**Components:**
- `BK` - Fixed prefix
- `YYYYMMDD` - Booking date
- `HHMM` - Creation time (hours and minutes)
- `XXXXX` - Combined code from practice and locum IDs plus random character

## Implementation Files

### 1. `src/lib/bookingIdGenerator.ts`
Main utility file containing:
- `generateBookingId()` - Generates full format booking ID
- `generateShortBookingId()` - Generates short format booking ID
- `isValidBookingId()` - Validates booking ID format
- `parseBookingId()` - Extracts information from booking ID

### 2. `prisma/schema.prisma`
Updated Booking model:
```prisma
model Booking {
  booking_id    String        @id  // Removed @default(cuid())
  // ... other fields
}
```

### 3. `src/pages/api/appointment/locum-confirm.ts`
Updated booking creation logic:
- Imports the `generateBookingId` function
- Generates custom booking ID before creating booking record
- Uses practice ID, locum ID, booking date, and other parameters

### 4. `src/lib/testBookingIdGenerator.ts`
Test and demonstration file showing:
- How to generate booking IDs
- Validation examples
- Usage patterns

## Benefits

1. **Meaningful Information**: IDs contain date, time, and participant information
2. **Sortable**: IDs naturally sort by date and time
3. **Traceable**: Easy to identify booking details from the ID alone
4. **Unique**: Combination of timestamp and random elements ensures uniqueness
5. **Human Readable**: Format is understandable for support and debugging

## Usage Example

```typescript
import { generateBookingId } from '@/lib/bookingIdGenerator';

const bookingId = generateBookingId({
  practiceId: 'clp1a2b3c4d5e6f7g8h9i0j1',
  locumId: 'cll9z8y7x6w5v4u3t2s1r0q9',
  bookingDate: new Date('2024-12-20T10:30:00Z'),
  bookingStartTime: '10:30',
  location: 'Central London Clinic'
});

// Result: BK-20241220-143015-PRCL001-LCZX789-A2F3
```

## Migration Notes

- **Database Schema**: Updated to remove auto-generation of booking_id
- **Existing Data**: Existing bookings retain their original CUID format
- **New Bookings**: All new bookings will use the new format
- **Backwards Compatibility**: System handles both old and new ID formats

## Validation

The system includes comprehensive validation:

```typescript
import { isValidBookingId, parseBookingId } from '@/lib/bookingIdGenerator';

const isValid = isValidBookingId('BK-20241220-143015-PRCL001-LCZX789-A2F3');
const info = parseBookingId('BK-20241220-143015-PRCL001-LCZX789-A2F3');

console.log(isValid); // true
console.log(info);    // { isValid: true, date: '20241220', time: '143015', format: 'full' }
```

## Testing

To test the booking ID generation:

1. Import the test function: `import { testBookingIdGeneration } from '@/lib/testBookingIdGenerator';`
2. Run the test: `testBookingIdGeneration();`
3. Check console output for generated IDs and validation results

## Future Enhancements

Potential improvements:
- Add location codes to the ID
- Implement booking type indicators
- Add checksum validation
- Create shorter aliases for frequent lookups

## Troubleshooting

**Issue: Prisma client generation errors**
- Solution: Restart development server, clear node_modules cache, or regenerate client

**Issue: Duplicate booking IDs**
- Very unlikely due to timestamp + random components
- System includes validation to prevent duplicates

**Issue: ID format validation fails**
- Check that ID matches expected regex patterns
- Ensure all components are properly formatted

## Support

For questions or issues related to the booking ID system, refer to:
- This documentation
- `src/lib/bookingIdGenerator.ts` source code
- Test examples in `src/lib/testBookingIdGenerator.ts`

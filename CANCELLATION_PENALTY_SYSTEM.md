# Cancellation Penalty System - Complete Documentation

## Overview

The cancellation penalty system automatically calculates and records penalties when bookings are cancelled within specific timeframes. The system uses **foreign key relations** to link penalties to locums and practices, enabling the admin to fetch complete details including payment card information.

## Database Schema

### CancellationPenalty Model

```prisma
model CancellationPenalty {
  id                     String   @id @default(cuid())
  bookingId              String   @map("booking_id")
  cancelledBy            String   @map("cancelled_by") // "locum" or "practice" or "branch"
  
  // Foreign Keys - one of these will be set based on who gets charged
  chargedLocumId         String?  @map("charged_locum_id")
  chargedPracticeId      String?  @map("charged_practice_id")
  
  cancelledPartyType     String   @map("cancelled_party_type") // "locum" or "practice"
  appointmentStartTime   DateTime @map("appointment_start_time")
  cancellationTime       DateTime @map("cancellation_time")
  hoursBeforeAppointment Float    @map("hours_before_appointment")
  penaltyHours           Float    @map("penalty_hours") // 3 or 6 hours
  hourlyRate             Float    @map("hourly_rate")
  penaltyAmount          Float    @map("penalty_amount")
  status                 String   @default("PENDING") // PENDING, CHARGED, DISMISSED
  reason                 String?
  chargedAt              DateTime? @map("charged_at")
  chargedBy              String?  @map("charged_by")
  dismissedAt            DateTime? @map("dismissed_at")
  dismissedBy            String?  @map("dismissed_by")
  dismissalReason        String?  @map("dismissal_reason")
  stripeChargeId         String?  @map("stripe_charge_id")
  notes                  String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  
  // Relations
  booking          Booking        @relation(fields: [bookingId], references: [id])
  chargedLocum     LocumProfile?  @relation(fields: [chargedLocumId], references: [id])
  chargedPractice  Practice?      @relation(fields: [chargedPracticeId], references: [id])
}
```

### Key Features

1. **Foreign Key Relations**: Direct links to `Booking`, `LocumProfile`, and `Practice` tables
2. **Conditional Relations**: Either `chargedLocumId` OR `chargedPracticeId` is set, never both
3. **Payment Card Access**: Through practice relation, get all active payment cards
4. **Stripe Integration**: Access Stripe customer ID for payment processing

## Penalty Rules

| Who Cancels | Timeframe | Who Gets Charged | Penalty Hours | Rate Used |
|------------|-----------|------------------|---------------|-----------|
| Locum | ≤ 24 hours | Locum | 6 | Locum's hourly rate |
| Locum | ≤ 48 hours (> 24h) | Locum | 3 | Locum's hourly rate |
| Practice/Branch | ≤ 24 hours | Practice | 6 | Locum's hourly rate |
| Practice/Branch | > 24 hours | No penalty | - | - |

## API Endpoints

### 1. Cancel Booking (Modified)

**Endpoint:** `POST /api/booking/cancel-booking`

**Request:**
```json
{
  "booking_id": "clxxxxx",
  "user_id": "clxxxxx",
  "user_type": "locum" | "practice" | "branch",
  "cancellation_reason": "Emergency situation"
}
```

**Response with Penalty:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. A penalty of £270.00 has been recorded and is pending admin review.",
  "data": {
    "id": "clxxxxx",
    "status": "CANCELLED",
    "cancel_by": "locum",
    "cancel_time": "2025-11-09T14:00:00.000Z"
    // ... other booking fields
  },
  "penalty": {
    "id": "clxxxxx",
    "bookingId": "clxxxxx",
    "cancelledBy": "locum",
    "chargedLocumId": "clxxxxx",
    "chargedPracticeId": null,
    "cancelledPartyType": "locum",
    "penaltyHours": 6,
    "hourlyRate": 45.00,
    "penaltyAmount": 270.00,
    "status": "PENDING",
    "reason": "Emergency situation"
  }
}
```

---

### 2. Get All Penalties (With Full Relations)

**Endpoint:** `GET /api/penalty/get-penalties`

**Query Parameters:**
- `status`: PENDING | CHARGED | DISMISSED
- `cancelledPartyType`: locum | practice
- `chargedLocumId`: Filter by specific locum
- `chargedPracticeId`: Filter by specific practice
- `limit`: Number of records (default: 50)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc | desc (default: desc)

**Example:**
```
GET /api/penalty/get-penalties?status=PENDING&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "penalties": [
      {
        "id": "clxxxxx",
        "bookingId": "clxxxxx",
        "cancelledBy": "practice",
        "chargedLocumId": null,
        "chargedPracticeId": "clxxxxx",
        "cancelledPartyType": "practice",
        "appointmentStartTime": "2025-11-10T09:00:00.000Z",
        "cancellationTime": "2025-11-09T22:00:00.000Z",
        "hoursBeforeAppointment": 11.0,
        "penaltyHours": 6,
        "hourlyRate": 50.00,
        "penaltyAmount": 300.00,
        "status": "PENDING",
        "reason": "Dentist unavailable",
        "booking": {
          "id": "clxxxxx",
          "bookingUniqueid": "BK123456",
          "booking_date": "2025-11-10T00:00:00.000Z",
          "booking_start_time": "09:00",
          "booking_end_time": "17:00",
          "location": "London Dental Clinic",
          "status": "CANCELLED"
        },
        "chargedLocum": null,
        "chargedPractice": {
          "id": "clxxxxx",
          "name": "City Dental Practice",
          "email": "admin@citydental.com",
          "telephone": "+44 20 1234 5678",
          "address": "123 High Street, London",
          "location": "London",
          "paymentCards": [
            {
              "id": "clxxxxx",
              "cardHolderName": "City Dental Ltd",
              "lastFourDigits": "4242",
              "cardType": "VISA",
              "isDefault": true
            }
          ],
          "stripeCustomer": {
            "stripeCustomerId": "cus_xxxxxxxxxx",
            "email": "billing@citydental.com",
            "name": "City Dental Practice"
          }
        },
        "createdAt": "2025-11-09T22:00:00.000Z",
        "updatedAt": "2025-11-09T22:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**Key Points:**
- `chargedPractice` is populated with **payment card details**
- `stripeCustomer` provides Stripe customer ID for charging
- `paymentCards` array shows all active cards (filtered)
- Only one of `chargedLocum` or `chargedPractice` will be populated

---

### 3. Get Penalty by ID

**Endpoint:** `GET /api/penalty/get-penalty-by-id?penalty_id=clxxxxx`

**Response for Locum Penalty:**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxx",
    "bookingId": "clxxxxx",
    "cancelledBy": "locum",
    "chargedLocumId": "clxxxxx",
    "chargedPracticeId": null,
    "cancelledPartyType": "locum",
    "penaltyHours": 3,
    "hourlyRate": 45.00,
    "penaltyAmount": 135.00,
    "status": "PENDING",
    "reason": "Personal emergency",
    "booking": {
      "id": "clxxxxx",
      "bookingUniqueid": "BK123457",
      "booking_date": "2025-11-12T00:00:00.000Z",
      "booking_start_time": "09:00",
      "booking_end_time": "17:00",
      "location": "Brighton Dental",
      "status": "CANCELLED"
    },
    "chargedLocum": {
      "id": "clxxxxx",
      "fullName": "John Smith",
      "emailAddress": "john.smith@email.com",
      "contactNumber": "+44 7700 900123",
      "hourlyPayRate": 45.00,
      "location": "London",
      "bankDetails": "HSBC - Sort: 12-34-56 - Acc: 12345678"
    },
    "chargedPractice": null
  }
}
```

**Note:** This endpoint includes `bankDetails` for locums, useful for admin reference.

---

### 4. Get Penalties by Booking

**Endpoint:** `GET /api/penalty/get-penalties-by-booking?booking_id=clxxxxx`

**Use Case:** Check if a specific booking has any penalties

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxx",
      "bookingId": "clxxxxx",
      "cancelledBy": "locum",
      "chargedLocumId": "clxxxxx",
      "chargedPracticeId": null,
      "penaltyAmount": 270.00,
      "status": "CHARGED",
      "chargedAt": "2025-11-10T10:00:00.000Z",
      "chargedBy": "admin_123",
      "stripeChargeId": "ch_1234567890",
      "chargedLocum": {
        // ... locum details
      },
      "chargedPractice": null
    }
  ]
}
```

---

## Admin Workflow

### Step 1: Fetch Pending Penalties

```javascript
const response = await fetch('/api/penalty/get-penalties?status=PENDING', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { data } = await response.json();
```

### Step 2: Review Penalty Details

For each penalty, the admin can see:
- **Who cancelled**: `cancelledBy` field
- **Who gets charged**: Either `chargedLocum` or `chargedPractice`
- **Penalty amount**: `penaltyAmount`
- **Reason**: `reason` field
- **Booking details**: `booking` object

### Step 3: Access Payment Information

#### For Practice Penalties:
```javascript
const penalty = data.penalties[0];
if (penalty.chargedPractice) {
  // Get Stripe customer ID
  const stripeCustomerId = penalty.chargedPractice.stripeCustomer?.stripeCustomerId;
  
  // Get payment cards
  const cards = penalty.chargedPractice.paymentCards;
  const defaultCard = cards.find(card => card.isDefault);
  
  // Charge via Stripe
  await chargeStripeCustomer(stripeCustomerId, penalty.penaltyAmount);
}
```

#### For Locum Penalties:
```javascript
const penalty = data.penalties[0];
if (penalty.chargedLocum) {
  // Locum penalties might be deducted from payments
  // Or charged separately - depends on your business logic
  
  const locum = penalty.chargedLocum;
  console.log(`Charge ${locum.fullName}: £${penalty.penaltyAmount}`);
  console.log(`Bank details: ${locum.bankDetails}`);
}
```

### Step 4: Update Penalty Status (Admin App Implementation)

**After Charging:**
```javascript
// This would be in your admin app
await prisma.cancellationPenalty.update({
  where: { id: penalty.id },
  data: {
    status: 'CHARGED',
    chargedAt: new Date(),
    chargedBy: adminUserId,
    stripeChargeId: stripeCharge.id,
    notes: 'Charged successfully via Stripe'
  }
});
```

**Or Dismiss:**
```javascript
await prisma.cancellationPenalty.update({
  where: { id: penalty.id },
  data: {
    status: 'DISMISSED',
    dismissedAt: new Date(),
    dismissedBy: adminUserId,
    dismissalReason: 'Valid emergency situation'
  }
});
```

---

## Integration with Stripe

### Getting Practice Stripe Customer

```javascript
const penalty = await fetch(`/api/penalty/get-penalty-by-id?penalty_id=${id}`);
const data = await penalty.json();

if (data.chargedPractice?.stripeCustomer) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  // Charge the customer
  const charge = await stripe.charges.create({
    amount: Math.round(data.penaltyAmount * 100), // Convert to cents
    currency: 'gbp',
    customer: data.chargedPractice.stripeCustomer.stripeCustomerId,
    description: `Cancellation penalty for booking ${data.booking.bookingUniqueid}`,
    metadata: {
      penalty_id: data.id,
      booking_id: data.bookingId,
      cancelled_by: data.cancelledBy
    }
  });
  
  // Update penalty with charge ID
  await updatePenalty(data.id, charge.id);
}
```

### Using Saved Payment Card

```javascript
const cards = data.chargedPractice.paymentCards;
const defaultCard = cards.find(c => c.isDefault) || cards[0];

// Card details are encrypted in database
// Use your existing card decryption logic
const cardDetails = await decryptCard(defaultCard.id);

// Process payment with your existing payment endpoint
const payment = await fetch('/api/payments/charge', {
  method: 'POST',
  body: JSON.stringify({
    practice_id: data.chargedPracticeId,
    amount: data.penaltyAmount,
    card_id: defaultCard.id,
    description: `Penalty for ${data.booking.bookingUniqueid}`
  })
});
```

---

## Database Migration

### Option 1: Prisma DB Push (Recommended)
```bash
npx prisma db push
npx prisma generate
```

### Option 2: Create Migration
```bash
npx prisma migrate dev --name add_cancellation_penalty_with_relations
```

### Migration SQL (Manual)
```sql
CREATE TABLE "cancellation_penalties" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "cancelled_by" TEXT NOT NULL,
    "charged_locum_id" TEXT,
    "charged_practice_id" TEXT,
    "cancelled_party_type" TEXT NOT NULL,
    "appointment_start_time" TIMESTAMP(3) NOT NULL,
    "cancellation_time" TIMESTAMP(3) NOT NULL,
    "hours_before_appointment" DOUBLE PRECISION NOT NULL,
    "penalty_hours" DOUBLE PRECISION NOT NULL,
    "hourly_rate" DOUBLE PRECISION NOT NULL,
    "penalty_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "charged_at" TIMESTAMP(3),
    "charged_by" TEXT,
    "dismissed_at" TIMESTAMP(3),
    "dismissed_by" TEXT,
    "dismissal_reason" TEXT,
    "stripe_charge_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_penalties_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "cancellation_penalties" 
  ADD CONSTRAINT "cancellation_penalties_booking_id_fkey" 
  FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE;

ALTER TABLE "cancellation_penalties" 
  ADD CONSTRAINT "cancellation_penalties_charged_locum_id_fkey" 
  FOREIGN KEY ("charged_locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE;

ALTER TABLE "cancellation_penalties" 
  ADD CONSTRAINT "cancellation_penalties_charged_practice_id_fkey" 
  FOREIGN KEY ("charged_practice_id") REFERENCES "practices"("id") ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX "cancellation_penalties_status_idx" ON "cancellation_penalties"("status");
CREATE INDEX "cancellation_penalties_charged_locum_id_idx" ON "cancellation_penalties"("charged_locum_id");
CREATE INDEX "cancellation_penalties_charged_practice_id_idx" ON "cancellation_penalties"("charged_practice_id");
CREATE INDEX "cancellation_penalties_booking_id_idx" ON "cancellation_penalties"("booking_id");
```

---

## Example Response Structure

### Practice Penalty (Full Details)
```json
{
  "id": "clxxxxx",
  "cancelledPartyType": "practice",
  "penaltyAmount": 300.00,
  "chargedPractice": {
    "name": "City Dental",
    "email": "admin@citydental.com",
    "telephone": "+44 20 1234 5678",
    "paymentCards": [
      {
        "cardHolderName": "City Dental Ltd",
        "lastFourDigits": "4242",
        "cardType": "VISA",
        "isDefault": true
      }
    ],
    "stripeCustomer": {
      "stripeCustomerId": "cus_ABC123",
      "email": "billing@citydental.com"
    }
  }
}
```

### Locum Penalty (Full Details)
```json
{
  "id": "clxxxxx",
  "cancelledPartyType": "locum",
  "penaltyAmount": 135.00,
  "chargedLocum": {
    "fullName": "John Smith",
    "emailAddress": "john@email.com",
    "contactNumber": "+44 7700 900123",
    "hourlyPayRate": 45.00,
    "bankDetails": "HSBC - Sort: 12-34-56"
  }
}
```

---

## Summary

✅ **Foreign Key Relations** - Direct access to full locum and practice details  
✅ **Payment Card Access** - Get active payment cards for practices  
✅ **Stripe Integration** - Access Stripe customer IDs for charging  
✅ **Complete Audit Trail** - Track who, what, when, and how much  
✅ **Flexible Filtering** - Query by status, party type, or specific IDs  
✅ **Admin Ready** - All data needed for charge/dismiss decisions  

The admin can now:
1. Fetch all pending penalties
2. See complete party details (locum OR practice)
3. Access payment cards for practices
4. Get Stripe customer IDs for charging
5. Make informed charge/dismiss decisions
6. Process payments with complete information


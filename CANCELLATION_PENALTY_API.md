# Cancellation Penalty API Documentation

## Overview

This document describes the cancellation penalty system for booking cancellations. When a booking is cancelled within specific timeframes, penalties are automatically calculated and recorded for admin review.

## Penalty Rules

### For Locum/Staff Cancellations
- **Within 48 hours but more than 24 hours**: 3 hours penalty at locum's hourly rate
- **Within 24 hours**: 6 hours penalty at locum's hourly rate

### For Practice/Branch Cancellations
- **Within 24 hours**: 6 hours penalty at locum's hourly rate
- **More than 24 hours**: No penalty

## Database Schema

### CancellationPenalty Model

```prisma
model CancellationPenalty {
  id                    String   @id @default(cuid())
  bookingId             String   @map("booking_id")
  cancelledBy           String   @map("cancelled_by") // "locum" or "practice" or "branch"
  cancelledPartyId      String   @map("cancelled_party_id") // ID of party who gets charged
  cancelledPartyName    String   @map("cancelled_party_name") // Name for display
  cancelledPartyType    String   @map("cancelled_party_type") // "locum" or "practice"
  appointmentStartTime  DateTime @map("appointment_start_time")
  cancellationTime      DateTime @map("cancellation_time")
  hoursBeforeAppointment Float   @map("hours_before_appointment")
  penaltyHours          Float    @map("penalty_hours") // 3 or 6 hours
  hourlyRate            Float    @map("hourly_rate")
  penaltyAmount         Float    @map("penalty_amount") // penaltyHours * hourlyRate
  status                String   @default("PENDING") // PENDING, CHARGED, DISMISSED
  reason                String?  // Cancellation reason
  chargedAt             DateTime? @map("charged_at")
  chargedBy             String?  @map("charged_by") // Admin ID who processed the charge
  dismissedAt           DateTime? @map("dismissed_at")
  dismissedBy           String?  @map("dismissed_by") // Admin ID who dismissed
  dismissalReason       String?  @map("dismissal_reason")
  stripeChargeId        String?  @map("stripe_charge_id") // Reference to Stripe charge
  notes                 String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("cancellation_penalties")
}
```

## API Endpoints

### 1. Cancel Booking (Modified)

**Endpoint:** `POST /api/booking/cancel-booking`

**Description:** Cancels a booking and automatically creates a penalty record if applicable.

**Authorization:** Required (Bearer token)

**Request Body:**
```json
{
  "booking_id": "clxxxxxxxxxxxxx",
  "user_id": "clxxxxxxxxxxxxx",
  "user_type": "locum" | "practice" | "branch",
  "cancellation_reason": "Optional reason for cancellation"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. A penalty of £45.00 has been recorded and is pending admin review.",
  "data": {
    "id": "clxxxxxxxxxxxxx",
    "request_id": "clxxxxxxxxxxxxx",
    "locum_id": "clxxxxxxxxxxxxx",
    "practice_id": "clxxxxxxxxxxxxx",
    "branch_id": "clxxxxxxxxxxxxx",
    "booking_date": "2025-11-10T00:00:00.000Z",
    "booking_start_time": "09:00",
    "booking_end_time": "17:00",
    "bookingUniqueid": "BK123456",
    "status": "CANCELLED",
    "location": "London Dental Clinic",
    "description": "Cancelled by locum",
    "accept_time": "2025-11-04T10:00:00.000Z",
    "cancel_by": "locum",
    "cancel_time": "2025-11-09T14:00:00.000Z",
    "createdAt": "2025-11-04T09:00:00.000Z",
    "updatedAt": "2025-11-09T14:00:00.000Z"
  },
  "penalty": {
    "id": "clxxxxxxxxxxxxx",
    "bookingId": "clxxxxxxxxxxxxx",
    "cancelledBy": "locum",
    "cancelledPartyId": "clxxxxxxxxxxxxx",
    "cancelledPartyName": "John Doe",
    "cancelledPartyType": "locum",
    "appointmentStartTime": "2025-11-10T09:00:00.000Z",
    "cancellationTime": "2025-11-09T14:00:00.000Z",
    "hoursBeforeAppointment": 19.5,
    "penaltyHours": 6,
    "hourlyRate": 45.00,
    "penaltyAmount": 270.00,
    "status": "PENDING",
    "reason": "Emergency came up",
    "chargedAt": null,
    "chargedBy": null,
    "dismissedAt": null,
    "dismissedBy": null,
    "dismissalReason": null,
    "stripeChargeId": null,
    "notes": null,
    "createdAt": "2025-11-09T14:00:00.000Z",
    "updatedAt": "2025-11-09T14:00:00.000Z"
  }
}
```

**Response Success (No Penalty - 200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. The appointment is now available for other locums to apply.",
  "data": {
    "id": "clxxxxxxxxxxxxx",
    // ... booking details
  },
  "penalty": null
}
```

**Response Error (400):**
```json
{
  "error": "Locum hourly rate not set"
}
```

**Response Error (401):**
```json
{
  "error": "Unauthorized: Invalid or expired token"
}
```

---

### 2. Get All Penalties

**Endpoint:** `GET /api/penalty/get-penalties`

**Description:** Fetches a list of all cancellation penalties with optional filtering and pagination.

**Authorization:** Required (Bearer token)

**Query Parameters:**
- `status` (optional): Filter by status - `PENDING`, `CHARGED`, or `DISMISSED`
- `cancelledPartyId` (optional): Filter by party ID
- `cancelledPartyType` (optional): Filter by party type - `locum` or `practice`
- `limit` (optional, default: 50): Number of records to return
- `offset` (optional, default: 0): Number of records to skip
- `sortBy` (optional, default: createdAt): Field to sort by
- `sortOrder` (optional, default: desc): Sort order - `asc` or `desc`

**Example Request:**
```
GET /api/penalty/get-penalties?status=PENDING&limit=20&offset=0&sortBy=penaltyAmount&sortOrder=desc
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "penalties": [
      {
        "id": "clxxxxxxxxxxxxx",
        "bookingId": "clxxxxxxxxxxxxx",
        "cancelledBy": "locum",
        "cancelledPartyId": "clxxxxxxxxxxxxx",
        "cancelledPartyName": "John Doe",
        "cancelledPartyType": "locum",
        "appointmentStartTime": "2025-11-10T09:00:00.000Z",
        "cancellationTime": "2025-11-09T14:00:00.000Z",
        "hoursBeforeAppointment": 19.5,
        "penaltyHours": 6,
        "hourlyRate": 45.00,
        "penaltyAmount": 270.00,
        "status": "PENDING",
        "reason": "Emergency came up",
        "chargedAt": null,
        "chargedBy": null,
        "dismissedAt": null,
        "dismissedBy": null,
        "dismissalReason": null,
        "stripeChargeId": null,
        "notes": null,
        "createdAt": "2025-11-09T14:00:00.000Z",
        "updatedAt": "2025-11-09T14:00:00.000Z"
      }
      // ... more penalties
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

---

### 3. Get Penalty by ID

**Endpoint:** `GET /api/penalty/get-penalty-by-id`

**Description:** Fetches a specific penalty by its ID.

**Authorization:** Required (Bearer token)

**Query Parameters:**
- `penalty_id` (required): The ID of the penalty to fetch

**Example Request:**
```
GET /api/penalty/get-penalty-by-id?penalty_id=clxxxxxxxxxxxxx
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxx",
    "bookingId": "clxxxxxxxxxxxxx",
    "cancelledBy": "practice",
    "cancelledPartyId": "clxxxxxxxxxxxxx",
    "cancelledPartyName": "City Dental Practice",
    "cancelledPartyType": "practice",
    "appointmentStartTime": "2025-11-08T14:00:00.000Z",
    "cancellationTime": "2025-11-08T10:00:00.000Z",
    "hoursBeforeAppointment": 4.0,
    "penaltyHours": 6,
    "hourlyRate": 50.00,
    "penaltyAmount": 300.00,
    "status": "PENDING",
    "reason": "Dentist called in sick",
    "chargedAt": null,
    "chargedBy": null,
    "dismissedAt": null,
    "dismissedBy": null,
    "dismissalReason": null,
    "stripeChargeId": null,
    "notes": null,
    "createdAt": "2025-11-08T10:00:00.000Z",
    "updatedAt": "2025-11-08T10:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "error": "Penalty not found"
}
```

---

### 4. Get Penalties by Booking ID

**Endpoint:** `GET /api/penalty/get-penalties-by-booking`

**Description:** Fetches all penalties associated with a specific booking.

**Authorization:** Required (Bearer token)

**Query Parameters:**
- `booking_id` (required): The ID of the booking

**Example Request:**
```
GET /api/penalty/get-penalties-by-booking?booking_id=clxxxxxxxxxxxxx
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxxxxx",
      "bookingId": "clxxxxxxxxxxxxx",
      "cancelledBy": "locum",
      "cancelledPartyId": "clxxxxxxxxxxxxx",
      "cancelledPartyName": "Jane Smith",
      "cancelledPartyType": "locum",
      "appointmentStartTime": "2025-11-10T09:00:00.000Z",
      "cancellationTime": "2025-11-09T14:00:00.000Z",
      "hoursBeforeAppointment": 19.5,
      "penaltyHours": 6,
      "hourlyRate": 40.00,
      "penaltyAmount": 240.00,
      "status": "CHARGED",
      "reason": "Personal emergency",
      "chargedAt": "2025-11-10T10:00:00.000Z",
      "chargedBy": "admin_clxxxxxxxxxxxxx",
      "dismissedAt": null,
      "dismissedBy": null,
      "dismissalReason": null,
      "stripeChargeId": "ch_1234567890",
      "notes": "Charged via Stripe",
      "createdAt": "2025-11-09T14:00:00.000Z",
      "updatedAt": "2025-11-10T10:00:00.000Z"
    }
  ]
}
```

---

## Admin Actions (To Be Implemented in Admin App)

The following actions should be implemented in the separate admin application:

### 1. Charge Penalty
- Update penalty status to `CHARGED`
- Set `chargedAt` timestamp
- Set `chargedBy` admin ID
- Process payment via Stripe
- Store `stripeChargeId` reference

### 2. Dismiss Penalty
- Update penalty status to `DISMISSED`
- Set `dismissedAt` timestamp
- Set `dismissedBy` admin ID
- Add `dismissalReason`

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters or business logic error |
| 401 | Unauthorized - Missing or invalid token |
| 404 | Not Found - Resource not found |
| 405 | Method Not Allowed - Wrong HTTP method |
| 500 | Internal Server Error |

---

## Business Logic Summary

1. **Cancellation Detection**: When a booking is cancelled via `/api/booking/cancel-booking`, the system automatically checks the time difference between cancellation and appointment start time.

2. **Penalty Calculation**:
   - **Locum cancels within 48 hours**: Creates penalty record
   - **Locum cancels within 24 hours**: Creates penalty with higher amount
   - **Practice cancels within 24 hours**: Creates penalty charged to practice
   - **Practice cancels 24-48 hours**: No penalty

3. **Penalty Record**: All penalties are created with status `PENDING` for admin review.

4. **Admin Review**: Admin can view all pending penalties and decide to:
   - Charge: Process payment and mark as `CHARGED`
   - Dismiss: Waive penalty and mark as `DISMISSED`

5. **Payment Processing**: When admin charges a penalty, the amount should be processed through Stripe (using existing payment infrastructure) and the transaction ID stored.

---

## Notes

- All monetary amounts are stored as Float values
- All timestamps are in UTC
- The `hourlyRate` used for penalty calculation is the locum's rate at the time of cancellation
- Penalties are calculated but not automatically charged - admin approval required
- The system prevents cancellations from being blocked - all cancellations are allowed but penalties are recorded when applicable


# Payment Receipt Email Implementation

## Overview
This document describes the implementation of automatic payment receipt emails sent to practice or branch users after successful timesheet submissions with AUTO payment mode.

## Flow

### 1. Timesheet Submission
When a locum submits a timesheet via `POST /api/timesheet/submit-timesheet`:

1. **Validation**: Checks if timesheet has complete jobs with start/end times
2. **Status Check**: Verifies timesheet is in DRAFT status
3. **Calculate Totals**: Computes total hours and pay from all jobs

### 2. Payment Mode Detection
For each job in the timesheet:

- **Branch Booking** (has `branchId`):
  - If `branch.paymentMode === 'AUTO'` → Charge **Branch**
  - Uses `BranchStripeCustomer.stripeCustomerId`
  - Sends email to `branch.email`

- **Practice Booking** (no `branchId`):
  - If `practice.paymentMode === 'AUTO'` → Charge **Practice**
  - Uses `StripeCustomer.stripeCustomerId`
  - Sends email to `practice.email`

### 3. Payment Processing
When payment mode is AUTO:

```javascript
// Call Stripe payment API
const paymentResponse = await fetch('/api/payments/create-payment', {
  method: 'POST',
  body: JSON.stringify({
    amount: Math.round(totalPay * 100), // Convert to pence
    currency: 'gbp',
    description: 'Booking details...',
    customer_id: stripeCustomer.stripeCustomerId,
    confirm: true,
    metadata: { /* booking details */ }
  })
});
```

### 4. Extract Receipt URL
After successful payment, extract the Stripe receipt URL:

```javascript
const paymentData = await paymentResponse.json();
const receiptUrl = paymentData.receipt_url || 
                   paymentData.charges?.data?.[0]?.receipt_url || '';
```

### 5. Send Email Notification
For each successful payment, automatically send email with:

- **Recipient**: Practice or Branch email
- **Subject**: "Payment Receipt - Booking {bookingId}"
- **Content**:
  - Amount charged
  - Booking ID
  - Locum name
  - Total hours worked
  - Hourly rate
  - Clickable button to view Stripe receipt

## Email Template

The email includes:

```html
✅ Professional header with brand colors
✅ Detailed payment information table
✅ Direct link to Stripe receipt (button)
✅ Total hours and hourly rate breakdown
✅ Practice/Branch identification
✅ Support contact information
✅ Professional footer
```

## Technical Implementation

### Backend Changes

#### File: `src/pages/api/timesheet/submit-timesheet.ts`

**Added:**
1. `sendPaymentReceiptEmail()` helper function
2. Import `form-data` for server-side multipart form handling
3. Email field retrieval in practice/branch queries
4. Receipt URL extraction from Stripe response
5. Async email sending after transaction completion

**Key Features:**
- Emails sent asynchronously (non-blocking)
- Error handling with console logging
- Receipt URL stored in payment metadata
- Professional HTML email template
- Fallback text version for email clients

### Database Schema

The `BookingPayment` table stores payment details including:

```prisma
model BookingPayment {
  metadata  Json?  // Includes receipt_url
  // ... other fields
}
```

Receipt URL is stored in metadata for future reference.

## Frontend Integration

### Redux Slice: `timesheetSlice.ts`

**No changes required** - The existing `submitTimesheet` async thunk already handles the API call:

```typescript
export const submitTimesheet = createAsyncThunk(
  'timesheet/submit',
  async (params: {
    timesheetId: string;
    staffSignature?: string;
    token: string;
  }) => {
    // Calls /api/timesheet/submit-timesheet
    // Email is sent automatically on backend
  }
);
```

### Email Slice: `emailSlice.ts`

**No changes required** - The email sending is handled entirely on the backend. The frontend doesn't need to manually trigger email sending.

## API Response

After successful timesheet submission:

```json
{
  "success": true,
  "message": "Timesheet submitted successfully, booking(s) completed, and payment(s) processed",
  "data": {
    "timesheetId": "...",
    "status": "SUBMITTED",
    "totalHours": 8.5,
    "totalPay": 425.00,
    "paymentResults": [
      {
        "bookingId": "...",
        "status": "SUCCESS",
        "chargeId": "ch_xxx",
        "receiptUrl": "https://pay.stripe.com/receipts/...",
        "recipientEmail": "practice@example.com",
        "recipientName": "Practice Name"
      }
    ]
  }
}
```

## Email Delivery

### Success Logging
```
✅ Payment receipt email sent to practice@example.com
```

### Async Processing
- Emails are sent asynchronously after the transaction commits
- Response is returned immediately to frontend
- Email failures are logged but don't affect timesheet submission

### Error Handling
```
❌ Failed to send payment receipt email: [error details]
```

## Testing Checklist

### Backend Testing

1. ✅ Submit timesheet with AUTO payment mode (branch)
2. ✅ Submit timesheet with AUTO payment mode (practice)
3. ✅ Submit timesheet with MANUAL payment mode (no email)
4. ✅ Verify receipt URL is extracted from Stripe response
5. ✅ Verify email is sent to correct recipient
6. ✅ Check email HTML rendering
7. ✅ Verify Stripe receipt link works
8. ✅ Test with missing email addresses (error handling)

### Frontend Testing

1. ✅ Submit timesheet via UI
2. ✅ Verify success message appears
3. ✅ Check payment status in response
4. ✅ Confirm no frontend email calls needed

## Payment Mode Logic

| Booking Type | Payment Mode | Action | Email Recipient |
|--------------|-------------|---------|----------------|
| Branch | AUTO | ✅ Charge Branch | branch.email |
| Branch | MANUAL | ❌ No charge | - |
| Practice | AUTO | ✅ Charge Practice | practice.email |
| Practice | MANUAL | ❌ No charge | - |

## Environment Variables Required

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_FUNCTION_URL=https://your-edge-function.supabase.co
SEND_EMAIL_FN_SECRET=your_email_function_secret
```

## Security Considerations

1. ✅ **Email Privacy**: Only practice/branch receives their own receipts
2. ✅ **Receipt URLs**: Generated by Stripe, expire after time period
3. ✅ **Payment Data**: Sensitive data stored in encrypted Stripe system
4. ✅ **Error Handling**: Payment failures logged, not exposed to frontend
5. ✅ **Rate Limiting**: Consider implementing email rate limits

## Future Enhancements

1. 📧 Add email templates customization
2. 📊 Track email delivery status
3. 🔔 Add SMS notifications option
4. 📄 Generate PDF receipts
5. 🔄 Resend receipt functionality
6. 📝 Email preferences management
7. 🌐 Multi-language support

## Support

For questions or issues:
- Check backend logs for email sending errors
- Verify Stripe receipt URLs are valid
- Ensure email service credentials are configured
- Test with valid email addresses

## Summary

This implementation provides:
- ✅ Automatic payment detection (AUTO vs MANUAL)
- ✅ Stripe payment processing on timesheet submission
- ✅ Automatic email with receipt URL
- ✅ Professional branded email template
- ✅ Proper error handling and logging
- ✅ Non-blocking async email delivery
- ✅ Complete payment audit trail

The system now automatically notifies practice/branch users when payments are processed, providing them with immediate access to their Stripe receipts.


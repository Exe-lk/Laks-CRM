# Frontend Usage Guide - Timesheet Submission with Auto-Payment & Receipt Emails

## Overview
This guide shows how to submit timesheets from the frontend. The payment processing and email notifications are **automatically handled by the backend** - no additional frontend code needed!

## Using Redux Slice

### 1. Import the Required Redux Actions

```typescript
import { useDispatch } from 'react-redux';
import { submitTimesheet } from '@/redux/slices/timesheetSlice';
import { AppDispatch } from '@/redux/store';
```

### 2. Submit Timesheet Component Example

```typescript
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitTimesheet } from '@/redux/slices/timesheetSlice';
import { RootState, AppDispatch } from '@/redux/store';

const TimesheetSubmitButton: React.FC<{ timesheetId: string; staffSignature: string }> = ({ 
  timesheetId, 
  staffSignature 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.timesheet);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('supabase_token') || '';

      // Dispatch the submit action
      const result = await dispatch(submitTimesheet({
        timesheetId,
        staffSignature,
        token
      })).unwrap();

      // Success! Backend automatically:
      // ✅ Processed the payment (if AUTO mode)
      // ✅ Sent receipt email to practice/branch
      // ✅ Completed the booking
      
      setSubmitSuccess(true);
      console.log('Timesheet submitted successfully:', result);
      
      // Show success message to user
      alert('Timesheet submitted successfully! Payment receipt has been sent via email.');
      
    } catch (err) {
      console.error('Failed to submit timesheet:', err);
      alert('Failed to submit timesheet. Please try again.');
    }
  };

  return (
    <div>
      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Submitting...' : 'Submit Timesheet'}
      </button>

      {error && (
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}

      {submitSuccess && (
        <div className="text-green-500 mt-2">
          ✅ Timesheet submitted! Receipt email sent to practice/branch.
        </div>
      )}
    </div>
  );
};

export default TimesheetSubmitButton;
```

### 3. Complete Page Example

```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitTimesheet, fetchTimesheets } from '@/redux/slices/timesheetSlice';
import { RootState, AppDispatch } from '@/redux/store';
import SignatureCanvas from 'react-signature-canvas';

const TimesheetPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentTimesheet, loading, error } = useSelector((state: RootState) => state.timesheet);
  const [signatureRef, setSignatureRef] = useState<any>(null);

  const handleSubmitTimesheet = async () => {
    if (!currentTimesheet || !signatureRef) return;

    // Get signature as base64
    const signatureData = signatureRef.toDataURL();
    
    // Get auth token
    const token = localStorage.getItem('supabase_token') || '';

    try {
      const result = await dispatch(submitTimesheet({
        timesheetId: currentTimesheet.id,
        staffSignature: signatureData,
        token
      })).unwrap();

      // Success notification
      console.log('Payment Results:', result.data?.paymentResults);
      
      // The backend has automatically:
      // 1. Checked if payment mode is AUTO or MANUAL
      // 2. If AUTO: charged the practice/branch card
      // 3. Sent receipt email with Stripe receipt URL
      // 4. Marked booking as COMPLETED
      
      alert(`Timesheet submitted successfully!
        Total Hours: ${result.data.totalHours}
        Total Pay: £${result.data.totalPay}
        Payment receipt has been sent via email.`);

      // Refresh timesheets
      dispatch(fetchTimesheets({
        userId: 'locum-user-id',
        userType: 'locum',
        token
      }));

    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit timesheet');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Timesheet</h1>

      {currentTimesheet && (
        <div className="bg-white rounded shadow p-4 mb-4">
          <h2>Timesheet Details</h2>
          <p>Total Hours: {currentTimesheet.totalHours}</p>
          <p>Total Pay: £{currentTimesheet.totalPay}</p>
          <p>Status: {currentTimesheet.status}</p>
        </div>
      )}

      <div className="bg-white rounded shadow p-4 mb-4">
        <h3>Staff Signature</h3>
        <SignatureCanvas
          ref={(ref) => setSignatureRef(ref)}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: 'border border-gray-300'
          }}
        />
        <button
          onClick={() => signatureRef?.clear()}
          className="mt-2 bg-gray-300 px-4 py-2 rounded"
        >
          Clear Signature
        </button>
      </div>

      <button
        onClick={handleSubmitTimesheet}
        disabled={loading || !signatureRef}
        className="bg-green-500 text-white px-6 py-3 rounded font-bold"
      >
        {loading ? 'Submitting...' : 'Submit Timesheet'}
      </button>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mt-4 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default TimesheetPage;
```

## What Happens Automatically?

When you call `dispatch(submitTimesheet(...))`, the backend automatically:

### ✅ Step 1: Validate Timesheet
- Checks if timesheet is in DRAFT status
- Validates all jobs have start/end times
- Calculates total hours and pay

### ✅ Step 2: Check Payment Mode
- **For Branch Bookings**: Checks `branch.paymentMode`
- **For Practice Bookings**: Checks `practice.paymentMode`

### ✅ Step 3: Process Payment (if AUTO)
- Charges the Stripe customer card
- Creates `BookingPayment` record
- Extracts receipt URL from Stripe response

### ✅ Step 4: Send Email (if payment successful)
- Sends email to `branch.email` or `practice.email`
- Includes professional HTML template
- Contains clickable link to Stripe receipt
- Shows payment details (amount, hours, rate)

### ✅ Step 5: Complete Booking
- Marks booking as `COMPLETED`
- Updates timesheet status to `SUBMITTED`

## API Response Structure

```typescript
{
  success: true,
  message: "Timesheet submitted successfully, booking(s) completed, and payment(s) processed",
  data: {
    timesheetId: "cuid_123",
    status: "SUBMITTED",
    staffSignatureDate: "2025-11-06T10:30:00Z",
    totalHours: 8.5,
    totalPay: 425.00,
    month: 11,
    year: 2025,
    locumName: "John Doe",
    totalJobs: 1,
    paymentResults: [
      {
        bookingId: "booking_456",
        status: "SUCCESS",
        chargeId: "ch_stripe_123",
        receiptUrl: "https://pay.stripe.com/receipts/...",
        recipientEmail: "practice@example.com",
        recipientName: "Practice Name",
        jobDetails: {
          totalPay: 425.00,
          totalHours: 8.5,
          hourlyRate: 50.00,
          bookingUniqueid: "BOOK-2025-001",
          locumName: "John Doe",
          chargedEntity: "practice"
        }
      }
    ]
  }
}
```

## Payment Status Handling

```typescript
const handlePaymentResults = (paymentResults: any[]) => {
  paymentResults.forEach(payment => {
    switch (payment.status) {
      case 'SUCCESS':
        console.log(`✅ Payment successful: ${payment.chargeId}`);
        console.log(`📧 Receipt sent to: ${payment.recipientEmail}`);
        console.log(`🔗 Receipt URL: ${payment.receiptUrl}`);
        break;
      
      case 'FAILED':
        console.warn(`❌ Payment failed: ${payment.error}`);
        // Handle payment failure (notify admin, etc.)
        break;
      
      case 'ERROR':
        console.error(`⚠️ Payment error: ${payment.error}`);
        break;
    }
  });
};
```

## Email Notification Details

The practice/branch user will receive an email with:

- **Subject**: "Payment Receipt - Booking BOOK-2025-001"
- **Content**:
  ```
  Dear Practice Name,
  
  Your payment has been processed successfully for the completed booking.
  
  Payment Details:
  - Amount Charged: £425.00
  - Booking ID: BOOK-2025-001
  - Locum Name: John Doe
  - Total Hours: 8.5 hours
  - Hourly Rate: £50.00
  - Charged To: Practice
  
  [View Receipt Button]
  
  Click the button above to view and download your payment receipt from Stripe.
  ```

## Error Handling

```typescript
try {
  await dispatch(submitTimesheet({...})).unwrap();
} catch (error: any) {
  // Handle different error types
  if (error.message?.includes('payment failed')) {
    alert('Payment processing failed. Please check your payment method.');
  } else if (error.message?.includes('incomplete')) {
    alert('Please complete all timesheet entries before submitting.');
  } else {
    alert('An error occurred. Please try again.');
  }
}
```

## No Additional Frontend Code Needed!

**Important**: You don't need to:
- ❌ Call any email API from frontend
- ❌ Handle Stripe payment processing
- ❌ Check payment mode manually
- ❌ Extract receipt URLs
- ❌ Send notifications

**Everything is automatic!** Just call `submitTimesheet()` and the backend handles:
✅ Payment processing
✅ Email sending with receipt
✅ Booking completion
✅ Status updates

## Testing

### Test with AUTO Payment Mode

1. Ensure practice/branch has `paymentMode: 'AUTO'`
2. Submit timesheet via UI
3. Check:
   - ✅ Payment processed
   - ✅ Email received at practice/branch email
   - ✅ Stripe receipt link works
   - ✅ Booking marked as COMPLETED

### Test with MANUAL Payment Mode

1. Set practice/branch to `paymentMode: 'MANUAL'`
2. Submit timesheet via UI
3. Check:
   - ✅ No payment charged
   - ✅ No email sent
   - ✅ Booking marked as COMPLETED

## Summary

The implementation is **fully automatic** on the backend:

1. **Frontend**: Call `dispatch(submitTimesheet(...))`
2. **Backend**: Checks payment mode automatically
3. **Backend**: Processes payment if AUTO mode
4. **Backend**: Sends email with receipt URL
5. **Frontend**: Receives success response

**No frontend changes needed for email functionality!**


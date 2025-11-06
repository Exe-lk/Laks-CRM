
## Payment API - Auto-Charging

### Create Payment Endpoint

**Endpoint:** `POST /api/payments/create-payment`

Universal payment processing endpoint that supports auto-charging for **Practice**, **Branch**, and **Locum** entities.

#### Request Payload

```json
{
  "amount": 5000,
  "currency": "gbp",
  "description": "Booking BOOKING_ID - Locum Name (Branch Name) - practice",
  "customer_id": "cus_xxxxxxxxxxxxx",
  "confirm": true,
  "metadata": {
    "booking_id": "booking_id_here",
    "timesheet_job_id": "timesheet_job_id_here",
    "timesheet_id": "timesheet_id_here",
    "locum_name": "John Doe",
    "practice_id": "practice_id_here",
    "branch_id": "branch_id_here",
    "branch_name": "Branch Name",
    "total_hours": 8.5,
    "hourly_rate": 50.0,
    "charged_entity": "practice"
  },
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "save_payment_method": false
}
```

#### Required Fields

- `amount` (number): Payment amount in **pence** (e.g., 5000 = £50.00)
- `currency` (string): Currency code (default: "gbp")
- `customer_id` (string): Stripe customer ID (from `StripeCustomer`, `BranchStripeCustomer`, or `LocumStripeCustomer` table)
- `confirm` (boolean): Set to `true` for automatic payment confirmation

#### Optional Fields

- `description` (string): Human-readable description of the payment
- `payment_method_id` (string): Specific payment method to use (if not provided, uses customer's default)
- `save_payment_method` (boolean): Whether to save the payment method for future use

#### Metadata Fields

The `metadata` object should contain all relevant entity information:

- `booking_id` (string): Booking ID
- `timesheet_job_id` (string): Timesheet job ID
- `timesheet_id` (string): Timesheet ID
- `locum_name` (string): Locum's full name
- `practice_id` (string): Practice ID (always present)
- `branch_id` (string | null): Branch ID (null if booking created by practice directly)
- `branch_name` (string | null): Branch name (null if booking created by practice directly)
- `total_hours` (number): Total hours worked
- `hourly_rate` (number): Hourly rate
- `charged_entity` (string): Entity being charged - one of: `"practice"`, `"branch"`, or `"locum"`

#### Auto-Charge Logic (from submit-timesheet.ts)

The system automatically determines which entity to charge based on:

**When Locum Submits Timesheet:**
1. **Branch Booking** (has `branchId`):
   - If `branch.paymentMode === 'AUTO'` → Charge **Branch**
   - Uses `BranchStripeCustomer.stripeCustomerId`
   - `charged_entity: "branch"`

2. **Practice Booking** (no `branchId`):
   - If `practice.paymentMode === 'AUTO'` → Charge **Practice**
   - Uses `StripeCustomer.stripeCustomerId`
   - `charged_entity: "practice"`

**From Admin Panel:**
3. **Locum Penalty** (from admin app):
   - Charge **Locum**
   - Uses `LocumStripeCustomer.stripeCustomerId`
   - `charged_entity: "locum"`

**Note:** Bookings are marked as COMPLETED and payments are automatically processed when the locum submits their timesheet (not when admin approves). Admin approval (approve-timesheet.ts) only locks the timesheet with manager signature.

#### Response

**Success (200):**
```json
{
  "id": "pi_xxxxxxxxxxxxx",
  "payment_intent": "pi_xxxxxxxxxxxxx",
  "status": "succeeded",
  "amount": 5000,
  "currency": "gbp"
}
```

**Error (400/500):**
```json
{
  "error": "Error message here"
}
```

#### Example Usage

**For Practice Auto-Charge:**
```javascript
await fetch('/api/payments/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: Math.round(50.00 * 100), // £50.00 in pence
    currency: 'gbp',
    description: 'Booking BOOK123 - John Doe - practice',
    customer_id: 'cus_practice123', // From StripeCustomer table
    confirm: true,
    metadata: {
      booking_id: 'booking123',
      timesheet_job_id: 'job123',
      timesheet_id: 'timesheet123',
      locum_name: 'John Doe',
      practice_id: 'practice123',
      branch_id: null,
      branch_name: null,
      total_hours: 8.5,
      hourly_rate: 50.0,
      charged_entity: 'practice'
    }
  })
});
```

**For Branch Auto-Charge:**
```javascript
await fetch('/api/payments/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: Math.round(75.00 * 100), // £75.00 in pence
    currency: 'gbp',
    description: 'Booking BOOK456 - Jane Smith (Branch A) - branch',
    customer_id: 'cus_branch456', // From BranchStripeCustomer table
    confirm: true,
    metadata: {
      booking_id: 'booking456',
      timesheet_job_id: 'job456',
      timesheet_id: 'timesheet456',
      locum_name: 'Jane Smith',
      practice_id: 'practice123',
      branch_id: 'branch456',
      branch_name: 'Branch A',
      total_hours: 10.0,
      hourly_rate: 75.0,
      charged_entity: 'branch'
    }
  })
});
```

**For Locum Penalty Charge:**
```javascript
await fetch('/api/payments/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: Math.round(25.00 * 100), // £25.00 in pence
    currency: 'gbp',
    description: 'Cancellation Penalty - John Doe',
    customer_id: 'cus_locum789', // From LocumStripeCustomer table
    confirm: true,
    metadata: {
      locum_id: 'locum789',
      locum_name: 'John Doe',
      penalty_type: 'cancellation',
      penalty_amount: 25.00,
      charged_entity: 'locum'
    }
  })
});
```

#### Notes

- **Amount is always in pence** - multiply by 100 (e.g., £50.00 = 5000)
- **Metadata is flexible** - include any additional fields needed for your use case
- **Entity-specific info** is in metadata, not hardcoded in the endpoint
- **Customer ID** must exist in the appropriate Stripe customer table before charging
- **PCI Compliant** - No card data is stored in the database, only Stripe customer IDs

### List Payment Methods Endpoint

**Endpoint:** `GET /api/payments/list-payment-methods`

Universal endpoint for retrieving saved payment methods (cards) stored in Stripe for **Practice**, **Branch**, and **Locum** entities.

**Request:**
```
GET /api/payments/list-payment-methods?practice_id=xxx
GET /api/payments/list-payment-methods?branch_id=xxx
GET /api/payments/list-payment-methods?locum_id=xxx
```

**Query Parameters:**
- `practice_id` (string, optional): Practice ID
- `branch_id` (string, optional): Branch ID
- `locum_id` (string, optional): Locum ID

**Note:** Only one of `practice_id`, `branch_id`, or `locum_id` is required.

**Response (200):**
```json
{
  "data": [
    {
      "id": "pm_xxxxxxxxxxxxx",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      }
    }
  ]
}
```

**Error (400/404):**
```json
{
  "error": "One of practice_id, branch_id, or locum_id is required"
}
```
or
```json
{
  "error": "Practice customer not found"
}
```

**Example Usage:**
```javascript
// Get Payment Methods for Practice
const response = await fetch('/api/payments/list-payment-methods?practice_id=practice123');
const data = await response.json();
console.log(data.data); // Array of payment methods

// Get Payment Methods for Branch
const response = await fetch('/api/payments/list-payment-methods?branch_id=branch456');
const data = await response.json();

// Get Payment Methods for Locum
const response = await fetch('/api/payments/list-payment-methods?locum_id=locum789');
const data = await response.json();
```

### Delete Payment Method Endpoint

**Endpoint:** `DELETE /api/payments/delete-payment-method`

Universal endpoint for removing/deleting payment methods (cards) from Stripe customers for **Practice**, **Branch**, and **Locum** entities.

**Request:**
```
DELETE /api/payments/delete-payment-method
```

**Request Body:**
```json
{
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "practice_id": "xxx"
}
```

**OR:**
```json
{
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "branch_id": "xxx"
}
```

**OR:**
```json
{
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "locum_id": "xxx"
}
```

**Required Fields:**
- `payment_method_id` (string): Stripe payment method ID to delete
- One of: `practice_id`, `branch_id`, or `locum_id` (string, optional): Entity ID (for validation)

**Response (200):**
```json
{
  "success": true,
  "message": "Payment method detached successfully"
}
```

**Error (400/404):**
```json
{
  "error": "Payment method ID is required"
}
```

**Example Usage:**
```javascript
// Delete Payment Method
await fetch('/api/payments/delete-payment-method', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_method_id: 'pm_xxxxxxxxxxxxx',
    practice_id: 'practice123' // or branch_id or locum_id (optional for validation)
  })
});
```

#### Notes

- **Payment methods are stored in Stripe** - not in your database
- **Card details are now returned** - including brand, last4, expiration date

### Set Default Payment Method Endpoint

**Endpoint:** `POST /api/payments/set-default-payment-method`

Universal endpoint for setting a default payment method for **Practice**, **Branch**, and **Locum** entities. The default payment method will be used when creating payment intents without specifying a payment_method_id.

**Request:**
```
POST /api/payments/set-default-payment-method
```

**Request Body:**
```json
{
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "practice_id": "xxx"
}
```

**OR:**
```json
{
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "branch_id": "xxx"
}
```

**OR:**
```json
{
  "payment_method_id": "pm_xxxxxxxxxxxxx",
  "locum_id": "xxx"
}
```

**Required Fields:**
- `payment_method_id` (string): Stripe payment method ID to set as default
- One of: `practice_id`, `branch_id`, or `locum_id` (string): Entity ID

**Response (200):**
```json
{
  "success": true,
  "customer": {
    "id": "cus_xxxxxxxxxxxxx",
    "email": "practice@example.com",
    "name": "Practice Name",
    "invoice_settings": {
      "default_payment_method": "pm_xxxxxxxxxxxxx"
    }
  }
}
```

**Error (400/404):**
```json
{
  "error": "Payment method ID is required"
}
```

**Example Usage:**
```javascript
// Set default payment method for Practice
await fetch('/api/payments/set-default-payment-method', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_method_id: 'pm_xxxxxxxxxxxxx',
    practice_id: 'practice123'
  })
});
```

### Get Customer Details Endpoint

**Endpoint:** `GET /api/payments/get-customer-details`

Universal endpoint for retrieving Stripe customer details including the default payment method for **Practice**, **Branch**, and **Locum** entities.

**Request:**
```
GET /api/payments/get-customer-details?practice_id=xxx
GET /api/payments/get-customer-details?branch_id=xxx
GET /api/payments/get-customer-details?locum_id=xxx
```

**Query Parameters:**
- `practice_id` (string, optional): Practice ID
- `branch_id` (string, optional): Branch ID
- `locum_id` (string, optional): Locum ID

**Note:** Only one of `practice_id`, `branch_id`, or `locum_id` is required.

**Response (200):**
```json
{
  "success": true,
  "customer": {
    "id": "cus_xxxxxxxxxxxxx",
    "email": "practice@example.com",
    "name": "Practice Name",
    "invoice_settings": {
      "default_payment_method": "pm_xxxxxxxxxxxxx"
    },
    "metadata": {
      "practice_id": "practice123"
    }
  },
  "default_payment_method": "pm_xxxxxxxxxxxxx"
}
```

**Error (400/404):**
```json
{
  "error": "One of practice_id, branch_id, or locum_id is required"
}
```

**Example Usage:**
```javascript
// Get customer details for Practice
const response = await fetch('/api/payments/get-customer-details?practice_id=practice123');
const data = await response.json();
console.log('Default payment method:', data.default_payment_method);

// Get customer details for Branch
const response = await fetch('/api/payments/get-customer-details?branch_id=branch456');
const data = await response.json();

// Get customer details for Locum
const response = await fetch('/api/payments/get-customer-details?locum_id=locum789');
const data = await response.json();
```

#### Payment Methods Summary

- **Payment methods are stored in Stripe** - not in your database
- **Card details are now returned** - including brand, last4, expiration date
- **Only one entity ID required** - provide either `practice_id`, `branch_id`, or `locum_id`
- **Customer must exist** - Entity must have a Stripe customer created via customer-management endpoints first
- **PCI Compliant** - All card data is handled by Stripe, you only get masked card info (last4, brand, expiry)
- **Default payment method** - Set a default card to be used when no specific payment_method_id is provided in payment intents



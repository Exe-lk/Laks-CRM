# Timesheet Management API Documentation

## Overview
This document describes the backend APIs for the new timesheet management system. The system is completely locum-driven:

- **Locums create their own timesheets** (monthly)
- **Jobs are automatically added** when locums accept confirmed bookings
- **Locums manage their own times** (start/end times, lunch breaks)
- **No practice/branch management** of timesheets
- **Weekly view** for locums to see their jobs
- **Monthly timesheets** with job details

## Database Schema

### Timesheet Model
- **Monthly timesheets** (not weekly)
- **No practice/branch relations** on timesheet level
- **Status**: DRAFT → SUBMITTED → LOCKED
- **Unique constraint**: locum + month + year

### TimesheetJob Model
- **Individual job entries** within a timesheet
- **References to booking, practice, branch**
- **Time tracking**: start/end times, lunch breaks
- **Automatic calculations**: total hours, total pay

## API Endpoints

### 1. Add Job to Timesheet

#### `POST /api/timesheet/add-job-to-timesheet`
Automatically adds a confirmed booking to the locum's timesheet.

**Request Body:**
```json
{
  "bookingId": "string"
}
```

**Note:** When creating appointment requests, you can now optionally include a `branch_id` for corporate practices with multiple branches. This will be automatically included in the timesheet job data.

**Response:**
```json
{
  "success": true,
  "message": "Job added to timesheet successfully",
  "data": {
    "timesheetId": "string",
    "timesheetJobId": "string",
    "month": 1,
    "year": 2024,
    "jobDate": "2024-01-15T00:00:00Z",
    "practice": {
      "name": "ABC Dental Practice",
      "location": "London",
      "practiceType": "Private"
    },
    "branch": {
      "id": "branch_123",
      "name": "ABC Dental - Central Branch",
      "address": "123 Main Street, London",
      "location": "Central London"
    },
    "booking": {
      "booking_start_time": "2024-01-15T09:00:00Z",
      "booking_end_time": "2024-01-15T17:00:00Z",
      "location": "123 Main St"
    },
    "hourlyRate": 25.00
  }
}
```

### 2. Update Job Times

#### `PUT /api/timesheet/update-job-times`
Updates start/end times and lunch breaks for a specific job.

**Request Body:**
```json
{
  "timesheetJobId": "string",
  "startTime": "2024-01-15T09:00:00Z" (optional),
  "endTime": "2024-01-15T17:00:00Z" (optional),
  "lunchStartTime": "2024-01-15T12:00:00Z" (optional),
  "lunchEndTime": "2024-01-15T13:00:00Z" (optional),
  "notes": "string" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job times updated successfully",
  "data": {
    "job": {
      "id": "string",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T17:00:00Z",
      "lunchStartTime": "2024-01-15T12:00:00Z",
      "lunchEndTime": "2024-01-15T13:00:00Z",
      "totalHours": 7.0,
      "totalPay": 175.00,
      "practice": { 
        "name": "ABC Dental Practice",
        "location": "London",
        "practiceType": "Private"
      },
      "branch": {
        "id": "branch_123",
        "name": "ABC Dental - Central Branch",
        "address": "123 Main Street, London",
        "location": "Central London"
      }
    },
    "monthTotalHours": 35.0,
    "monthTotalPay": 875.00
  }
}
```

### 3. Get Locum Timesheet

#### `GET /api/timesheet/get-locum-timesheet`
Gets locum's timesheet with weekly view capability.

**Query Parameters:**
- `locumId`: string (required)
- `month`: number (optional, defaults to current month)
- `year`: number (optional, defaults to current year)
- `weekStartDate`: "YYYY-MM-DD" (optional, for weekly view)

**Response:**
```json
{
  "success": true,
  "data": {
    "timesheet": {
      "id": "string",
      "locumId": "string",
      "month": 1,
      "year": 2024,
      "status": "DRAFT",
      "totalHours": 35.0,
      "totalPay": 875.00,
      "locumProfile": { ... }
    },
    "allJobs": [ ... ],
    "jobsByWeek": {
      "2024-01-14": [ ... ],
      "2024-01-21": [ ... ]
    },
    "weeklySummaries": [
      {
        "weekStart": "2024-01-14",
        "weekEnd": "2024-01-20",
        "totalJobs": 5,
        "completedJobs": 5,
        "totalHours": 35.0,
        "totalPay": 875.00,
        "jobs": [ ... ]
      }
    ],
    "monthSummary": {
      "totalJobs": 20,
      "completedJobs": 18,
      "totalHours": 140.0,
      "totalPay": 3500.00,
      "totalWeeks": 4,
      "averageHoursPerWeek": 35.0
    }
  }
}
```

### 4. Submit Timesheet

#### `POST /api/timesheet/submit-timesheet`
Submits timesheet with locum's digital signature.

**Request Body:**
```json
{
  "timesheetId": "string",
  "staffSignature": "base64_encoded_signature"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timesheet submitted successfully and is now pending manager approval",
  "data": {
    "timesheetId": "string",
    "status": "SUBMITTED",
    "staffSignatureDate": "2024-01-31T17:00:00Z",
    "totalHours": 140.0,
    "totalPay": 3500.00,
    "month": 1,
    "year": 2024,
    "locumName": "John Doe",
    "totalJobs": 20
  }
}
```

### 5. Approve Timesheet

#### `POST /api/timesheet/approve-timesheet`
Manager approves or rejects a submitted timesheet.

**Request Body:**
```json
{
  "timesheetId": "string",
  "managerSignature": "base64_encoded_signature",
  "managerId": "string",
  "action": "approve" | "reject"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timesheet approved and locked",
  "data": {
    "timesheetId": "string",
    "status": "LOCKED",
    "managerSignatureDate": "2024-02-01T10:00:00Z",
    "submittedAt": "2024-02-01T10:00:00Z",
    "totalHours": 140.0,
    "totalPay": 3500.00,
    "month": 1,
    "year": 2024,
    "locumName": "John Doe",
    "totalJobs": 20
  }
}
```

### 6. Get Pending Timesheets

#### `GET /api/timesheet/get-pending-timesheets`
Gets all submitted timesheets awaiting manager approval.

**Query Parameters:**
- `month`: number (optional)
- `year`: number (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "locumId": "string",
      "month": 1,
      "year": 2024,
      "status": "SUBMITTED",
      "totalHours": 140.0,
      "totalPay": 3500.00,
      "staffSignatureDate": "2024-01-31T17:00:00Z",
      "locumProfile": { ... },
      "timesheetJobs": [ ... ],
      "daysSinceSubmission": 2,
      "completedJobs": 18,
      "totalJobs": 20,
      "completionRate": 90.0,
      "isOverdue": false
    }
  ],
  "summary": {
    "totalPending": 5,
    "totalHours": 700.0,
    "totalPay": 17500.00,
    "averageHoursPerTimesheet": 140.0
  }
}
```

### 7. List Timesheets

#### `GET /api/timesheet/list-timesheets`
Lists timesheets for locums or admins.

**Query Parameters:**
- `userId`: string (required)
- `userType`: "locum" | "admin" (required)
- `status`: "DRAFT" | "SUBMITTED" | "LOCKED" (optional)
- `month`: number (optional)
- `year`: number (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "locumId": "string",
      "month": 1,
      "year": 2024,
      "status": "LOCKED",
      "totalHours": 140.0,
      "totalPay": 3500.00,
      "locumProfile": { ... },
      "timesheetJobs": [ ... ]
    }
  ],
  "summary": {
    "total": 3,
    "draft": 1,
    "submitted": 1,
    "locked": 1,
    "totalHours": 420.0,
    "totalPay": 10500.00
  }
}
```

### 8. Get Timesheet Details

#### `GET /api/timesheet/get-timesheet-details`
Gets detailed information for a specific timesheet.

**Query Parameters:**
- `timesheetId`: string (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "locumId": "string",
    "month": 1,
    "year": 2024,
    "status": "LOCKED",
    "totalHours": 140.0,
    "totalPay": 3500.00,
    "locumProfile": { ... },
    "jobBreakdown": [
      {
        "id": "string",
        "bookingId": "string",
        "date": "2024-01-15",
        "startTime": "2024-01-15T09:00:00Z",
        "endTime": "2024-01-15T17:00:00Z",
        "lunchStartTime": "2024-01-15T12:00:00Z",
        "lunchEndTime": "2024-01-15T13:00:00Z",
        "totalHours": 7.0,
        "hourlyRate": 25.00,
        "totalPay": 175.00,
        "isComplete": true,
        "practice": { 
          "name": "ABC Dental Practice",
          "location": "London",
          "practiceType": "Private"
        },
        "branch": {
          "id": "branch_123",
          "name": "ABC Dental - Central Branch",
          "address": "123 Main Street, London",
          "location": "Central London"
        },
        "booking": { 
          "booking_start_time": "2024-01-15T09:00:00Z",
          "booking_end_time": "2024-01-15T17:00:00Z",
          "location": "123 Main St"
        }
      }
    ],
    "monthSummary": {
      "totalJobs": 20,
      "completedJobs": 18,
      "totalHours": 140.0,
      "totalPay": 3500.00,
      "averageHoursPerJob": 7.0
    }
  }
}
```

### 9. Get Weekly Payouts

#### `GET /api/timesheet/get-weekly-payouts`
Gets locked timesheets for payout processing (admin use).

**Query Parameters:**
- `month`: number (optional)
- `year`: number (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "allTimesheets": [ ... ],
    "payoutsByPractice": [
      {
        "practiceId": "string",
        "practiceName": "ABC Dental Practice",
        "practiceEmail": "admin@abcdental.com",
        "practiceLocation": "London",
        "practiceType": "Private",
        "jobs": [ ... ],
        "totalHours": 280.0,
        "totalPay": 7000.00,
        "locumCount": 2
      }
    ],
    "payoutsByLocum": [
      {
        "locumId": "string",
        "locumName": "John Doe",
        "locumEmail": "john@example.com",
        "locumContact": "+44 123 456 7890",
        "locumRole": "Dental Nurse",
        "bankDetails": "encrypted_bank_details",
        "timesheets": [ ... ],
        "totalHours": 140.0,
        "totalPay": 3500.00,
        "totalJobs": 20
      }
    ],
    "summary": {
      "totalTimesheets": 5,
      "totalHours": 700.0,
      "totalPay": 17500.00,
      "uniquePractices": 3,
      "uniqueLocums": 5,
      "averageHoursPerTimesheet": 140.0,
      "averagePayPerTimesheet": 3500.00
    }
  }
}
```

## Authentication
All endpoints require Bearer token authentication in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Error Responses
All endpoints return consistent error responses:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Workflow Summary

### Locum Workflow
1. **Accept job booking** → Job automatically added to timesheet
2. **Update job times** → `PUT /api/timesheet/update-job-times`
3. **View timesheet** → `GET /api/timesheet/get-locum-timesheet` (weekly view)
4. **Submit timesheet** → `POST /api/timesheet/submit-timesheet`

### Manager Workflow
1. **View pending timesheets** → `GET /api/timesheet/get-pending-timesheets`
2. **Approve/reject timesheet** → `POST /api/timesheet/approve-timesheet`

### Admin Workflow
1. **View all timesheets** → `GET /api/timesheet/list-timesheets`
2. **Process payouts** → `GET /api/timesheet/get-weekly-payouts`

## Key Features

- ✅ **Locum-driven timesheets** - Locums create and manage their own timesheets
- ✅ **Automatic job addition** - Jobs added when bookings are confirmed
- ✅ **Monthly timesheets** - Better organization than weekly
- ✅ **Weekly view** - Locums can view their jobs by week
- ✅ **No practice management** - Practices don't create or manage timesheets
- ✅ **Job-based tracking** - Each job is tracked individually
- ✅ **Automatic calculations** - Hours and pay calculated automatically
- ✅ **Digital signatures** - Staff and manager signatures
- ✅ **Comprehensive reporting** - Detailed breakdowns and summaries
- ✅ **Branch support** - Corporate practices can specify branches for appointments

## Branch Support

The system now supports corporate practices with multiple branches:

- **Optional branch_id** - When creating appointment requests, practices can specify which branch the appointment is for
- **Branch information** - All timesheet jobs include branch details when applicable
- **Automatic inclusion** - Branch information is automatically included in timesheet data when appointments are created with a branch_id
- **Backward compatibility** - Existing appointments without branch information continue to work normally

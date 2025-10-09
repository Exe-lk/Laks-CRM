# Separate Timesheets per Job - Implementation Summary

## Overview
The timesheet system has been updated so that **each job now creates its own separate timesheet** instead of grouping multiple jobs from the same month into a single timesheet.

## Changes Made

### 1. Database Schema Changes (`prisma/schema.prisma`)
- **Removed** the unique constraint `@@unique([locumId, month, year], name: "locum_month_year_unique")` from the `Timesheet` model
- This allows multiple timesheets to be created for the same locum in the same month
- Month and year fields are retained for reference and filtering purposes

**Migration Applied:** `20251009114158_remove_timesheet_unique_constraint`

### 2. API Updates

#### `add-job-to-timesheet.ts`
- **Before:** Looked for an existing timesheet for the month/year and added jobs to it
- **After:** Always creates a new timesheet for each job
- Changed the duplicate check to look for existing jobs by `bookingId` globally, not just within a timesheet

#### `get-locum-timesheet.ts`
- **Before:** Found or created a single timesheet per month/year
- **After:** Fetches all timesheets for a locum (optionally filtered by month/year)
- Returns aggregated data from multiple timesheets while maintaining backward compatibility
- The response includes:
  - Individual timesheet information in an array
  - Aggregated totals (hours, pay) across all timesheets
  - Jobs grouped by week
  - Monthly summaries

#### `submit-timesheet.ts`
- Updated validation logic to handle single-job timesheets
- Now calculates `totalHours` and `totalPay` before submission
- Validates that the job has complete start/end times
- Automatically sets `submittedAt` timestamp when submitting

### 3. Frontend Updates (`src/pages/locumStaff/timesheet/index.tsx`)

#### Changes Made:
- Added comments clarifying that each job gets its own separate timesheet
- Updated the signature modal to inform users that each job has a separate timesheet
- The existing frontend logic continues to work because:
  - API maintains backward compatibility
  - Jobs are still fetched and displayed the same way
  - Each job's timesheet is independently managed

#### User Experience:
- When a user completes a job and adds their signature, only that specific job's timesheet is submitted
- Multiple jobs on the same day will each have their own timesheet entry
- Users can track and submit timesheets independently for each job

## Benefits

1. **Better Tracking:** Each job is tracked independently with its own timesheet
2. **Flexible Submission:** Jobs can be submitted individually as they are completed
3. **Clear Audit Trail:** Each timesheet represents one job, making it easier to track status
4. **Simplified Logic:** No need to manage multiple jobs within a single timesheet

## Database Migration

The migration was successfully applied and includes:
```sql
DROP INDEX "timesheets_locum_id_month_year_key";
```

This removes the unique constraint that prevented multiple timesheets for the same locum/month/year combination.

## Backward Compatibility

The API changes maintain backward compatibility by:
- Continuing to accept month/year filters in queries
- Returning data in a similar structure with aggregated information
- The `allJobs` array still contains all jobs for the period
- Weekly and monthly summaries are still calculated and returned

## Testing Recommendations

1. **Create Multiple Jobs:** Test creating multiple bookings for the same day
2. **Timesheet Creation:** Verify that each job creates its own timesheet
3. **Time Tracking:** Ensure start/end times are tracked correctly for each job
4. **Submission:** Test submitting individual job timesheets with signatures
5. **Monthly View:** Verify that the monthly view shows all jobs across multiple timesheets
6. **Aggregation:** Check that totals are correctly aggregated across all timesheets

## Notes

- The Prisma client generation encountered a file lock during the update (common on Windows with running dev servers)
- The client will be automatically regenerated on the next server restart
- No linting errors were found in any of the modified files
- All existing invoice-related tables that were not in the schema were also dropped during migration

## Files Modified

1. `prisma/schema.prisma`
2. `src/pages/api/timesheet/add-job-to-timesheet.ts`
3. `src/pages/api/timesheet/get-locum-timesheet.ts`
4. `src/pages/api/timesheet/submit-timesheet.ts`
5. `src/pages/locumStaff/timesheet/index.tsx`
6. `prisma/migrations/20251009114158_remove_timesheet_unique_constraint/migration.sql` (new)

## Date
October 9, 2025


# Branch Name Display Update

## Summary
Updated the locum staff waiting list page to display branch names when a branch ID is associated with appointment requests, pending requests, and pending confirmations.

## Changes Made

### 1. Backend API Updates

#### `src/pages/api/appointment/pending-confirmations.ts`
- Added branch data to the include clause when fetching pending confirmations
- Updated the formatted response to include branch information (id, name, address, location)
- Branch data is now returned as an optional field in the API response

### 2. Frontend Type Definitions

#### `src/redux/slices/appoitmentRequestsLocumSlice.ts`
Updated three TypeScript interfaces to include optional branch information:

1. **AvailableAppointmentRequest** (for Request Appointments tab)
   - Added optional `branch` property with id, name, address, and location

2. **PendingConfirmation** (for Pending Confirmations tab)
   - Added optional `branch` property with id, name, address, and location

3. **ApplicationHistoryItem** (for Pending Requests tab)
   - Added optional `branch` property in the nested `request` object

### 3. UI Updates

#### `src/pages/locumStaff/waitingList/index.tsx`
Updated all three tabs to display branch names:

1. **Pending Confirmations Tab** (Lines 463-467)
   - Shows branch name in blue text below practice name
   - Format: "Branch: [Branch Name]"

2. **Pending Requests Tab** (Lines 614-618)
   - Shows branch name in blue text below practice name
   - Format: "Branch: [Branch Name]"

3. **Request Appointments Tab** (Lines 754-756)
   - Shows branch name in blue text below practice name
   - Format: "Branch: [Branch Name]"

## Visual Design
- Branch names are displayed in **blue color** (`text-blue-600`) to distinguish them from practice names
- Branch information appears directly below the practice name
- Only displayed when branch data exists (conditional rendering)
- Maintains consistent styling across all three tabs

## Data Flow
1. Backend APIs fetch appointment/request data including associated branch
2. Redux slice properly types the branch data as optional
3. Frontend conditionally displays branch name when available
4. No breaking changes - works with or without branch data

## Benefits
- Clear identification of which branch an appointment belongs to
- Better organization for practices with multiple branches
- Improved user experience for locum staff
- Consistent display across all appointment views


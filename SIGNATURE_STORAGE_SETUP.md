# Signature Storage Setup Guide

## Overview

This guide explains how to set up Supabase Storage for saving staff and manager signatures as images for the timesheet system.

## 1. Create Supabase Storage Bucket

### Step 1: Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar

### Step 2: Create the Bucket
1. Click **New bucket**
2. Enter bucket name: `signatures`
3. Set as **Public bucket** (so URLs can be accessed)
4. Click **Create bucket**

### Step 3: Configure Bucket Policies (Optional)

For better security, you can set up RLS (Row Level Security) policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'signatures');

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'signatures');
```

## 2. Update Environment Variables

Make sure your `.env` file contains the Supabase credentials:

```env
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## 3. How It Works

### Frontend Flow

1. **User draws signature** on the signature canvas (using `react-signature-canvas`)
2. **Canvas converts to image** (Data URL format: `data:image/png;base64,...`)
3. **Image uploads to Supabase** via `/api/timesheet/upload-signature` endpoint
4. **URL is returned** and stored in the database

### Backend Flow

1. **Upload Signature API** (`/api/timesheet/upload-signature`)
   - Receives signature image as file upload
   - Converts to buffer
   - Uploads to Supabase Storage bucket `signatures`
   - Returns public URL

2. **Submit Timesheet API** (`/api/timesheet/submit-timesheet`)
   - Receives staff signature URL
   - Updates timesheet record with `staffSignature` field
   - Changes status to `SUBMITTED`

3. **Approve Timesheet API** (`/api/timesheet/approve-timesheet`)
   - Receives manager signature URL and manager ID
   - Updates timesheet with `managerSignature` field
   - Changes status to `LOCKED` (if approved)

## 4. Database Schema

The timesheet table includes these signature-related fields:

```prisma
model Timesheet {
  // ... other fields
  
  staffSignature        String?   @map("staff_signature")      // URL to signature image
  staffSignatureDate    DateTime? @map("staff_signature_date")
  managerSignature      String?   @map("manager_signature")    // URL to signature image
  managerSignatureDate  DateTime? @map("manager_signature_date")
  managerId             String?   @map("manager_id")
  
  // ... other fields
}
```

## 5. API Endpoints

### Upload Signature
```typescript
POST /api/timesheet/upload-signature

Headers:
  Authorization: Bearer <token>

Body (multipart/form-data):
  signature: <file>
  timesheetId: string
  signatureType: 'staff' | 'manager'

Response:
{
  success: true,
  data: {
    signatureUrl: string,
    fileName: string,
    filePath: string
  }
}
```

### Submit Timesheet
```typescript
POST /api/timesheet/submit-timesheet

Headers:
  Authorization: Bearer <token>

Body (JSON):
{
  timesheetId: string,
  staffSignatureUrl: string
}

Response:
{
  success: true,
  message: "Timesheet submitted successfully",
  data: { ... }
}
```

### Approve Timesheet
```typescript
POST /api/timesheet/approve-timesheet

Headers:
  Authorization: Bearer <token>

Body (JSON):
{
  timesheetId: string,
  managerSignatureUrl: string,
  managerId: string,
  action: 'approve' | 'reject'
}

Response:
{
  success: true,
  message: "Timesheet approved and locked",
  data: { ... }
}
```

## 6. Signature Storage Structure

Signatures are stored in Supabase Storage with the following path structure:

```
signatures/
└── timesheet-signatures/
    ├── {timesheetId}_staff_signature_{timestamp}.png
    └── {timesheetId}_manager_signature_{timestamp}.png
```

Example:
```
signatures/timesheet-signatures/clx123abc_staff_signature_1696234567890.png
```

## 7. Frontend Usage

The signature modal uses `react-signature-canvas` to capture signatures:

```typescript
import SignatureCanvas from 'react-signature-canvas';

// Create refs for signature canvases
const staffSignatureRef = useRef<SignatureCanvas>(null);
const managerSignatureRef = useRef<SignatureCanvas>(null);

// Get signature as Data URL
const staffSignatureDataUrl = staffSignatureRef.current.toDataURL();

// Check if signature is empty
const isEmpty = staffSignatureRef.current.isEmpty();

// Clear signature
staffSignatureRef.current.clear();
```

## 8. Testing the Feature

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to timesheet page**
   - Go to Locum Staff > Timesheet
   - Select a booking that has started
   - Click "Start" to begin tracking time
   - Click "End" to finish tracking

3. **Submit with signature**
   - After clicking "End", the signature modal appears
   - Draw staff signature on the canvas
   - Optionally draw manager signature
   - Click "Submit Timesheet"

4. **Verify in Supabase**
   - Go to Supabase Dashboard > Storage > signatures
   - You should see the uploaded signature images
   - Go to Database > Table Editor > timesheet
   - Check the `staff_signature` and `manager_signature` fields contain URLs

## 9. Troubleshooting

### Signatures not uploading
- Check Supabase storage bucket exists and is public
- Verify environment variables are correct
- Check browser console for errors
- Ensure authentication token is valid

### Images not displaying
- Verify the URL in the database is accessible
- Check bucket policies allow public read access
- Try accessing the URL directly in a browser

### Upload fails with 413 error
- Image size exceeds limit (default 5MB)
- Reduce signature canvas quality or size

### CORS errors
- Check Supabase CORS settings
- Ensure your domain is whitelisted in Supabase project settings

## 10. Security Considerations

1. **Authentication**: All signature upload endpoints require valid JWT token
2. **File type validation**: Only image files are accepted
3. **File size limit**: Maximum 5MB per signature
4. **Public bucket**: Signatures are publicly accessible (necessary for displaying in UI)
5. **Unique filenames**: Each signature has a unique timestamp to prevent conflicts

## 11. Future Enhancements

- Add signature verification/comparison
- Implement signature compression for smaller file sizes
- Add ability to view/download previous signatures
- Implement signature expiration/deletion policy
- Add audit trail for signature changes


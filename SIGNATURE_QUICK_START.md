# 🚀 Signature Feature - Quick Start Guide

## ✅ Prerequisites Checklist

Before using the signature feature, ensure:

- [ ] Supabase Storage bucket `signatures` is created and public
- [ ] Environment variables are configured in `.env`
- [ ] `react-signature-canvas` package is installed
- [ ] API endpoints are deployed (`upload-signature`, `submit-timesheet`, `approve-timesheet`)

---

## 📋 Setup Steps (5 minutes)

### Step 1: Create Supabase Bucket

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Storage** → Click **New bucket**
3. Name: `signatures`
4. Toggle **Public bucket**: ON
5. Click **Create bucket**

### Step 2: Verify Environment Variables

Check your `.env` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
DATABASE_URL=[your-database-url]
```

### Step 3: Test the Feature

```bash
npm run dev
```

Navigate to: `http://localhost:3000/locumStaff/timesheet`

---

## 🎨 How to Use (User Perspective)

### For Staff Members:

1. **Complete your shift**
   - Click "Start" at shift beginning
   - Click "End" at shift completion

2. **Sign the timesheet**
   - Signature modal appears automatically
   - Draw your signature in the canvas
   - Click "Clear" if you want to redraw
   - Click "Submit Timesheet"

3. **Done!**
   - Your signature is saved as an image
   - Timesheet submitted for approval

### For Managers:

**Option A: Immediate Approval (at time of submission)**
1. Staff draws their signature
2. Manager draws signature in second canvas
3. Manager enters their Manager ID
4. Both signatures saved, timesheet auto-approved

**Option B: Later Approval (separate flow)**
1. Review submitted timesheets
2. Use approval interface
3. Draw signature and approve

---

## 🔧 Technical Quick Reference

### Import and Setup

```tsx
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';

const signatureRef = useRef<SignatureCanvas>(null);
```

### Get Signature Data

```tsx
// Check if empty
const isEmpty = signatureRef.current?.isEmpty();

// Get as Data URL (PNG)
const dataUrl = signatureRef.current?.toDataURL();

// Clear canvas
signatureRef.current?.clear();
```

### Upload Signature

```tsx
const uploadSignature = async (dataUrl: string, type: 'staff' | 'manager') => {
  const blob = await fetch(dataUrl).then(r => r.blob());
  
  const formData = new FormData();
  formData.append('signature', blob, `${type}_signature.png`);
  formData.append('timesheetId', timesheetId);
  formData.append('signatureType', type);

  const response = await fetch('/api/timesheet/upload-signature', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  const { data } = await response.json();
  return data.signatureUrl; // Returns: https://...supabase.co/...signature.png
};
```

### Submit with Signature

```tsx
const submitTimesheet = async () => {
  const dataUrl = staffSignatureRef.current.toDataURL();
  const signatureUrl = await uploadSignature(dataUrl, 'staff');

  await fetch('/api/timesheet/submit-timesheet', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timesheetId,
      staffSignatureUrl: signatureUrl
    })
  });
};
```

---

## 📊 Data Flow

```
User draws signature
    ↓
Canvas → Data URL (base64 PNG)
    ↓
Data URL → Blob
    ↓
FormData with Blob
    ↓
POST /api/timesheet/upload-signature
    ↓
Supabase Storage
    ↓
Returns: https://...supabase.co/.../signature.png
    ↓
POST /api/timesheet/submit-timesheet
    ↓
Database: staffSignature = "https://..."
```

---

## 🗂️ File Structure

```
signatures/                           (Supabase bucket)
└── timesheet-signatures/
    ├── abc123_staff_signature_1696234567890.png
    ├── abc123_manager_signature_1696234567891.png
    ├── xyz789_staff_signature_1696234567892.png
    └── ...
```

---

## 🔍 Troubleshooting

### Issue: Signature not saving

**Check:**
- Browser console for errors
- Supabase bucket exists and is public
- Token is valid (check localStorage)

**Fix:**
```bash
# Verify bucket in Supabase Dashboard
# Check browser console: Press F12
# Check token: localStorage.getItem('token')
```

### Issue: Canvas is blank

**Check:**
- `react-signature-canvas` installed
- Import statement correct
- Ref properly attached

**Fix:**
```bash
npm list react-signature-canvas
# Should show: react-signature-canvas@1.1.0-alpha.2
```

### Issue: Upload fails with 403

**Check:**
- Supabase bucket policies
- Bucket is public
- Token is valid

**Fix:**
```sql
-- In Supabase SQL Editor
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');
```

### Issue: TypeScript errors

**Check:**
- Type definition file exists at `src/types/react-signature-canvas.d.ts`

**Fix:**
```bash
# File should exist, if not:
# Create src/types/react-signature-canvas.d.ts
# Content is in SIGNATURE_FEATURE_SUMMARY.md
```

---

## 🧪 Testing Checklist

- [ ] Can draw staff signature
- [ ] Can clear staff signature
- [ ] Can submit with staff signature only
- [ ] Signature uploads to Supabase
- [ ] URL saved in database
- [ ] Image accessible via browser
- [ ] Can draw manager signature
- [ ] Can submit with both signatures
- [ ] Timesheet auto-approves with manager signature
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Mobile/touch drawing works

---

## 📞 Quick Help

### View Uploaded Signatures:
1. Supabase Dashboard → Storage → signatures
2. Navigate to timesheet-signatures folder
3. Click any PNG to view

### View Database Records:
1. Supabase Dashboard → Table Editor → timesheet
2. Look for `staff_signature` and `manager_signature` columns
3. Should contain URLs like: `https://...supabase.co/...`

### Access Signature Image:
1. Copy URL from database
2. Paste in browser
3. Should display signature image

---

## 📚 Related Documentation

- **SIGNATURE_FEATURE_SUMMARY.md** - Complete implementation details
- **SIGNATURE_STORAGE_SETUP.md** - Detailed setup guide
- **SIGNATURE_UPLOAD_EXAMPLE.md** - Code examples
- **TIMESHEET_API_DOCUMENTATION.md** - API reference

---

## 🎯 Common Use Cases

### Use Case 1: Staff Only Signature
```
Staff finishes shift → Draws signature → Submits → Manager approves later
```

### Use Case 2: Immediate Manager Approval
```
Staff finishes → Draws signature → Manager present → Manager signs → Auto-approved
```

### Use Case 3: Manager Review & Approve
```
Staff submitted timesheets → Manager reviews → Manager signs → Approves/Rejects
```

---

## ⚡ Performance Tips

1. **Signature Size**: Canvas is 160px tall, keeps file size small
2. **PNG Format**: Good balance of quality and size
3. **Supabase CDN**: Fast global delivery of signature images
4. **Lazy Loading**: Signatures only load when modal opens

---

## 🔒 Security Notes

- ✅ Authentication required for all uploads
- ✅ File type validation (images only)
- ✅ File size limit (5MB max)
- ✅ Unique filenames prevent conflicts
- ✅ Signatures stored in dedicated bucket
- ⚠️ Bucket is public (necessary for UI display)
- ⚠️ No PII in filenames (uses random IDs)

---

## 🎉 Success!

If you can:
1. Draw a signature
2. Submit a timesheet
3. See the signature image in Supabase Storage
4. See the URL in the database

**You're all set!** 🚀

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Status:** Production Ready


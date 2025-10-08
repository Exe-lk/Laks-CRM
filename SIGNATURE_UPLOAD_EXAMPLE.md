# Timesheet Signature Upload Example

This document provides examples of how to use the new signature image upload functionality for timesheets.

## Frontend Implementation Example

### 1. Upload Staff Signature

```javascript
// Upload staff signature image
const uploadStaffSignature = async (timesheetId, signatureFile) => {
  const formData = new FormData();
  formData.append('timesheetId', timesheetId);
  formData.append('signatureType', 'staff');
  formData.append('signature', signatureFile);

  const response = await fetch('/api/timesheet/upload-signature', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result.data.signatureUrl;
};

// Submit timesheet with signature URL
const submitTimesheet = async (timesheetId, signatureUrl) => {
  const response = await fetch('/api/timesheet/submit-timesheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      timesheetId: timesheetId,
      staffSignatureUrl: signatureUrl
    })
  });

  return await response.json();
};
```

### 2. Upload Manager Signature

```javascript
// Upload manager signature image
const uploadManagerSignature = async (timesheetId, signatureFile) => {
  const formData = new FormData();
  formData.append('timesheetId', timesheetId);
  formData.append('signatureType', 'manager');
  formData.append('signature', signatureFile);

  const response = await fetch('/api/timesheet/upload-signature', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result.data.signatureUrl;
};

// Approve timesheet with signature URL
const approveTimesheet = async (timesheetId, signatureUrl, managerId) => {
  const response = await fetch('/api/timesheet/approve-timesheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      timesheetId: timesheetId,
      managerSignatureUrl: signatureUrl,
      managerId: managerId,
      action: 'approve'
    })
  });

  return await response.json();
};
```

### 3. Complete Workflow Example

```javascript
// Complete workflow for submitting a timesheet
const submitTimesheetWithSignature = async (timesheetId, signatureFile) => {
  try {
    // Step 1: Upload signature image
    const signatureUrl = await uploadStaffSignature(timesheetId, signatureFile);
    
    // Step 2: Submit timesheet with signature URL
    const result = await submitTimesheet(timesheetId, signatureUrl);
    
    console.log('Timesheet submitted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    throw error;
  }
};

// Complete workflow for approving a timesheet
const approveTimesheetWithSignature = async (timesheetId, signatureFile, managerId) => {
  try {
    // Step 1: Upload manager signature image
    const signatureUrl = await uploadManagerSignature(timesheetId, signatureFile);
    
    // Step 2: Approve timesheet with signature URL
    const result = await approveTimesheet(timesheetId, signatureUrl, managerId);
    
    console.log('Timesheet approved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error approving timesheet:', error);
    throw error;
  }
};
```

## React Component Example

```jsx
import React, { useState } from 'react';

const SignatureUpload = ({ timesheetId, signatureType, onSignatureUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Please select an image file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('timesheetId', timesheetId);
      formData.append('signatureType', signatureType);
      formData.append('signature', selectedFile);

      const response = await fetch('/api/timesheet/upload-signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        onSignatureUploaded(result.data.signatureUrl);
        setSelectedFile(null);
      } else {
        alert('Error uploading signature: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading signature');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {selectedFile && (
        <div>
          <p>Selected: {selectedFile.name}</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Signature'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SignatureUpload;
```

## File Requirements

- **File types**: PNG, JPG, JPEG, GIF, WebP
- **Maximum size**: 5MB
- **Validation**: Only image files are accepted
- **Storage**: Files are stored in Supabase "signatures" bucket

## Error Handling

The API returns appropriate error messages for:
- Invalid file types
- File size exceeding 5MB
- Missing required fields
- Authentication errors
- Upload failures

## Security Notes

- All uploads require valid authentication tokens
- Files are validated on the server side
- Unique filenames prevent conflicts
- Files are stored in a dedicated Supabase bucket

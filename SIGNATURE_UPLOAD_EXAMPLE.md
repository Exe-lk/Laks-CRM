# Timesheet Signature Upload Example

This document provides examples of how to use the signature image upload functionality for timesheets.

## 🎨 New Canvas-Based Implementation (Recommended)

The system now uses **react-signature-canvas** for drawing signatures directly in the browser. This is the recommended approach as it provides a better user experience.

### Canvas-Based Signature Component

```tsx
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignatureModal = ({ timesheetId, onSubmit }) => {
  const staffSignatureRef = useRef<SignatureCanvas>(null);
  const managerSignatureRef = useRef<SignatureCanvas>(null);
  const [managerId, setManagerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearStaffSignature = () => {
    staffSignatureRef.current?.clear();
  };

  const clearManagerSignature = () => {
    managerSignatureRef.current?.clear();
  };

  const uploadSignatureImage = async (signatureDataUrl: string, signatureType: 'staff' | 'manager'): Promise<string> => {
    const token = localStorage.getItem('token');
    
    // Convert data URL to blob
    const blob = await fetch(signatureDataUrl).then(r => r.blob());
    
    // Create form data
    const formData = new FormData();
    formData.append('signature', blob, `${signatureType}_signature.png`);
    formData.append('timesheetId', timesheetId);
    formData.append('signatureType', signatureType);

    // Upload to server
    const uploadResponse = await fetch('/api/timesheet/upload-signature', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || 'Failed to upload signature');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.data.signatureUrl;
  };

  const handleSubmit = async () => {
    // Validate staff signature
    if (!staffSignatureRef.current || staffSignatureRef.current.isEmpty()) {
      setError('Staff signature is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Get staff signature as data URL
      const staffSignatureDataUrl = staffSignatureRef.current.toDataURL();
      
      // Upload staff signature
      const staffSignatureUrl = await uploadSignatureImage(staffSignatureDataUrl, 'staff');

      // Submit timesheet with staff signature
      const submitResponse = await fetch('/api/timesheet/submit-timesheet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheetId: timesheetId,
          staffSignatureUrl: staffSignatureUrl
        })
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || 'Failed to submit timesheet');
      }

      // If manager signature is provided, upload and approve
      if (managerSignatureRef.current && !managerSignatureRef.current.isEmpty() && managerId.trim()) {
        const managerSignatureDataUrl = managerSignatureRef.current.toDataURL();
        const managerSignatureUrl = await uploadSignatureImage(managerSignatureDataUrl, 'manager');

        await fetch('/api/timesheet/approve-timesheet', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timesheetId: timesheetId,
            managerSignatureUrl: managerSignatureUrl,
            managerId: managerId,
            action: 'approve'
          })
        });
      }

      onSubmit();
    } catch (err: any) {
      setError(err.message || 'Failed to submit timesheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Submit Timesheet</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Staff Signature */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Staff Signature <span className="text-red-500">*</span>
              </label>
              <button
                onClick={clearStaffSignature}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={staffSignatureRef}
                canvasProps={{
                  className: 'w-full h-40 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Draw your signature above</p>
          </div>

          {/* Manager Signature */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Manager Signature <span className="text-gray-400">(Optional)</span>
              </label>
              <button
                onClick={clearManagerSignature}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={managerSignatureRef}
                canvasProps={{
                  className: 'w-full h-40 cursor-crosshair',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Manager can draw signature above</p>
          </div>

          {/* Manager ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager ID <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="Manager's ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C3EAE7] focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div className="text-xs bg-blue-50 p-3 rounded border border-blue-200 mt-2">
            <p className="text-blue-800 font-medium">ℹ️ Important Information:</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• By signing, you confirm that all time entries are accurate</li>
              <li>• Manager signature and ID are optional at this stage</li>
              <li>• If both manager signature and ID are provided, the timesheet will be automatically approved</li>
              <li>• Signatures will be saved as images</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {/* handle close */}}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#C3EAE7] text-black font-medium rounded-lg hover:bg-[#A9DBD9] disabled:bg-gray-300"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Timesheet'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Key Features of Canvas Implementation

1. **Drawing Interface**: Users draw signatures with mouse/touch
2. **Data URL Conversion**: Canvas converts to PNG data URL
3. **Blob Upload**: Data URL converts to blob for upload
4. **Automatic Upload**: Signature uploads when submitting
5. **Clear Functionality**: Users can clear and redraw

---

## 📁 Alternative: File Upload Implementation

This section shows the alternative approach using file uploads. The canvas approach above is recommended for better UX.

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

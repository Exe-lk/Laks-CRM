# Industrial-Standard File Upload System

## Overview

This document describes the new industrial-standard file upload system implemented for the CRM application. The system provides robust, individual file uploads with progress tracking, retry mechanisms, and comprehensive error handling.

## Key Features

### ✅ Individual File Uploads
- Files are uploaded one at a time instead of in batches
- Each file has its own progress tracking and error handling
- Prevents total failure when one file has issues

### ✅ Progress Tracking
- Real-time progress indicators for each file
- Visual progress bars with percentage completion
- Status indicators (pending, uploading, retrying, completed, error)

### ✅ Retry Mechanism
- Automatic retry for network-related errors
- Exponential backoff with jitter to prevent server overload
- Configurable retry attempts (default: 3)
- Smart retry logic that only retries appropriate errors

### ✅ Error Handling
- Comprehensive error categorization
- User-friendly error messages
- Detailed error logging for debugging
- Graceful degradation for non-retryable errors

### ✅ Network Resilience
- Timeout handling (default: 60 seconds)
- Connection retry for slow networks
- Abort controller for cancellation
- File size validation (10MB limit)

### ✅ User Experience
- Loading animations and progress indicators
- Cancel individual uploads
- Retry failed uploads
- Detailed upload results summary
- Success/failure notifications

## Architecture

### Components

1. **UploadService** (`src/services/uploadService.ts`)
   - Core upload logic with retry mechanisms
   - Progress tracking and error handling
   - Singleton pattern for consistent state management

2. **UploadProgress Component** (`src/components/UploadProgress.tsx`)
   - Visual progress indicator
   - Status display and user actions
   - Cancel and retry functionality

3. **Upload Helpers** (`src/utils/uploadHelpers.ts`)
   - Utility functions for error handling
   - File validation and formatting
   - Upload summary calculations

4. **Individual Upload API** (`src/pages/api/locum-profile/upload-single-document.ts`)
   - Backend endpoint for single file uploads
   - File validation and storage
   - Database updates

### Data Flow

```
User selects files → Frontend validates → Individual uploads → Progress tracking → Results display
```

## Implementation Details

### Upload Process

1. **File Selection**: User selects multiple documents
2. **Validation**: Client-side validation for file type and size
3. **Individual Upload**: Each file uploaded separately via API
4. **Progress Tracking**: Real-time progress updates for each file
5. **Error Handling**: Automatic retry for retryable errors
6. **Results Display**: Summary of successful and failed uploads

### Error Categories

#### Retryable Errors
- Network connection issues
- Timeout errors
- Server temporary unavailability
- Rate limiting

#### Non-Retryable Errors
- Invalid file type
- File size exceeded
- Authentication errors
- Server configuration errors

### Retry Logic

```typescript
// Exponential backoff with jitter
const delay = baseDelay * Math.pow(2, retryCount) + jitter;
```

- **Base Delay**: 1 second
- **Max Retries**: 3 attempts
- **Max Delay**: 30 seconds
- **Jitter**: 10% randomization to prevent thundering herd

## Configuration

### Upload Options

```typescript
interface UploadOptions {
  maxRetries?: number;        // Default: 3
  retryDelay?: number;        // Default: 1000ms
  timeout?: number;           // Default: 30000ms
  onProgress?: (progress) => void;
  onComplete?: (result) => void;
  onError?: (error) => void;
}
```

### File Validation

- **Allowed Types**: PDF, JPG, PNG, GIF, WEBP, DOC, DOCX, TXT
- **Max Size**: 10MB per file
- **Storage**: Supabase with unique filenames

## Usage Examples

### Basic Upload

```typescript
const results = await uploadService.uploadFiles(files, locumId, {
  maxRetries: 3,
  onProgress: (progress) => {
    console.log(`${progress.fileName}: ${progress.progress}%`);
  }
});
```

### With Custom Error Handling

```typescript
const results = await uploadService.uploadFiles(files, locumId, {
  onError: (error) => {
    if (error.willRetry) {
      console.log(`Will retry: ${error.fileName}`);
    } else {
      console.error(`Permanent failure: ${error.fileName}`);
    }
  }
});
```

## Performance Optimizations

### Network Efficiency
- Individual uploads prevent large request timeouts
- Progress tracking reduces perceived wait time
- Retry logic handles temporary network issues

### User Experience
- Non-blocking UI during uploads
- Cancel functionality for long uploads
- Detailed feedback on upload status

### Server Load
- Exponential backoff prevents server overload
- Individual requests are easier to handle
- Better error isolation

## Security Features

### File Validation
- Server-side file type validation
- File size limits enforced
- MIME type checking

### Authentication
- Token-based authentication required
- User authorization for file access
- Secure file storage with unique names

### Error Handling
- No sensitive information in error messages
- Proper error logging for debugging
- Graceful failure handling

## Monitoring and Debugging

### Progress Tracking
- Real-time upload progress
- Retry attempt counting
- Success/failure rates

### Error Logging
- Detailed error messages
- Retry attempt tracking
- Network condition monitoring

### Performance Metrics
- Upload time tracking
- Success rate monitoring
- Error categorization

## Best Practices

### For Developers
1. Always handle upload errors gracefully
2. Provide clear user feedback
3. Implement proper retry logic
4. Validate files before upload
5. Use progress indicators for long uploads

### For Users
1. Check file size before upload
2. Ensure stable internet connection
3. Don't close browser during uploads
4. Retry failed uploads when prompted

## Troubleshooting

### Common Issues

#### Upload Timeout
- **Cause**: Large files or slow network
- **Solution**: Increase timeout or compress files

#### Network Errors
- **Cause**: Unstable internet connection
- **Solution**: System automatically retries

#### File Type Errors
- **Cause**: Unsupported file format
- **Solution**: Convert to supported format

#### Size Limit Errors
- **Cause**: File exceeds 10MB limit
- **Solution**: Compress or split file

### Debug Information

The system provides detailed logging for debugging:
- Upload attempt tracking
- Error categorization
- Network condition monitoring
- Performance metrics

## Future Enhancements

### Planned Features
- Resume interrupted uploads
- Parallel upload optimization
- Advanced file compression
- Upload queue management
- Bandwidth throttling

### Performance Improvements
- Chunked upload for large files
- WebSocket progress updates
- Background upload processing
- Caching optimization

## Conclusion

The new upload system provides a robust, user-friendly solution for file uploads that handles network issues gracefully and provides excellent user feedback. The individual upload approach ensures that temporary issues with one file don't affect the entire upload process, making the system much more reliable for users with varying network conditions.

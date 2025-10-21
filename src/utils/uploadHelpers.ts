import { UploadError, UploadResult } from '@/services/uploadService';

export interface UploadSummary {
  totalFiles: number;
  successfulUploads: number;
  failedUploads: number;
  successRate: number;
  errors: UploadError[];
  results: UploadResult[];
}

export const calculateUploadSummary = (
  results: UploadResult[],
  errors: UploadError[]
): UploadSummary => {
  const totalFiles = results.length + errors.length;
  const successfulUploads = results.filter(r => r.success).length;
  const failedUploads = errors.length;
  const successRate = totalFiles > 0 ? (successfulUploads / totalFiles) * 100 : 0;

  return {
    totalFiles,
    successfulUploads,
    failedUploads,
    successRate,
    errors,
    results,
  };
};

export const getRetryableErrors = (errors: UploadError[]): UploadError[] => {
  return errors.filter(error => {
    const retryableErrorMessages = [
      'network',
      'timeout',
      'connection',
      'server error',
      'temporary',
      'unavailable',
      'rate limit'
    ];
    
    return retryableErrorMessages.some(keyword => 
      error.error.toLowerCase().includes(keyword)
    );
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const getFileTypeIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️';
    case 'doc':
    case 'docx':
      return '📝';
    case 'txt':
      return '📃';
    default:
      return '📎';
  }
};

export const generateUniqueFileId = (fieldName: string): string => {
  return `${fieldName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createUploadErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (message.includes('timeout')) {
    return 'Upload timeout. The file is too large or your connection is too slow. Please try again.';
  }
  
  if (message.includes('size') || message.includes('too large')) {
    return 'File size exceeds the maximum allowed limit (10MB). Please choose a smaller file.';
  }
  
  if (message.includes('type') || message.includes('format')) {
    return 'Invalid file type. Please upload a supported file format (PDF, JPG, PNG, DOC, DOCX, TXT).';
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Authentication error. Please log in again and try uploading.';
  }
  
  if (message.includes('server') || message.includes('500')) {
    return 'Server error. Please try again in a few moments.';
  }
  
  return 'Upload failed. Please try again.';
};

export const shouldRetryUpload = (error: Error, retryCount: number, maxRetries: number): boolean => {
  if (retryCount >= maxRetries) return false;
  
  const message = error.message.toLowerCase();
  const retryableErrors = [
    'network',
    'timeout',
    'connection',
    'server error',
    'temporary',
    'unavailable',
    'rate limit'
  ];
  
  return retryableErrors.some(keyword => message.includes(keyword));
};

export const getRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

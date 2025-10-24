import { supabase } from '@/lib/supabase';
import { 
  createUploadErrorMessage, 
  shouldRetryUpload, 
  getRetryDelay,
  generateUniqueFileId 
} from '@/utils/uploadHelpers';

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'retrying';
  error?: string;
  retryCount: number;
  url?: string;
}

export interface UploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: UploadError) => void;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  url: string;
  success: boolean;
  retryCount: number;
}

export interface UploadError {
  fileId: string;
  fileName: string;
  error: string;
  retryCount: number;
  willRetry: boolean;
}

export class UploadService {
  private static instance: UploadService;
  private uploadQueue: Map<string, AbortController> = new Map();
  private readonly DEFAULT_OPTIONS: Required<UploadOptions> = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    onProgress: () => {},
    onComplete: () => {},
    onError: () => {},
  };

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  /**
   * Upload a single file with retry logic and progress tracking
   */
  async uploadFile(
    file: File,
    fileId: string,
    locumId: string,
    fieldName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const fileName = `${locumId}_${fieldName}_${Date.now()}.${this.getFileExtension(file.name)}`;
    const filePath = `${locumId}/${fileName}`;
    
    let retryCount = 0;
    let lastError: Error | null = null;

    // Create abort controller for this upload
    const abortController = new AbortController();
    this.uploadQueue.set(fileId, abortController);

    try {
      while (retryCount <= opts.maxRetries) {
        try {
          // Update progress to show retry status
          if (retryCount > 0) {
            opts.onProgress({
              fileId,
              fileName: file.name,
              progress: 0,
              status: 'retrying',
              retryCount,
            });
            
            // Wait before retry with exponential backoff
            const delay = getRetryDelay(retryCount, opts.retryDelay);
            await this.delay(delay);
          }

          // Update progress to show uploading
          opts.onProgress({
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
            retryCount,
          });

          // Upload with timeout
          const uploadPromise = this.performUpload(file, filePath, fileId, opts.onProgress);
          const timeoutPromise = this.createTimeoutPromise(opts.timeout);
          
          const url = await Promise.race([uploadPromise, timeoutPromise]);
          
          // Check if upload was aborted
          if (abortController.signal.aborted) {
            throw new Error('Upload was cancelled');
          }

          // Success
          const result: UploadResult = {
            fileId,
            fileName: file.name,
            url,
            success: true,
            retryCount,
          };

          opts.onProgress({
            fileId,
            fileName: file.name,
            progress: 100,
            status: 'completed',
            retryCount,
            url,
          });

          opts.onComplete(result);
          return result;

        } catch (error) {
          lastError = error as Error;
          
          // Check if we should retry
          if (shouldRetryUpload(error as Error, retryCount, opts.maxRetries)) {
            retryCount++;
            console.warn(`Upload attempt ${retryCount} failed for ${file.name}:`, error);
            continue;
          } else {
            // Don't retry for non-retryable errors
            break;
          }
        }
      }

      throw lastError || new Error('Upload failed after all retries');

    } catch (error) {
      const friendlyErrorMessage = createUploadErrorMessage(error as Error);
      const uploadError: UploadError = {
        fileId,
        fileName: file.name,
        error: friendlyErrorMessage,
        retryCount,
        willRetry: shouldRetryUpload(error as Error, retryCount, opts.maxRetries),
      };

      opts.onProgress({
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: friendlyErrorMessage,
        retryCount,
      });

      opts.onError(uploadError);
      throw error;
    } finally {
      this.uploadQueue.delete(fileId);
    }
  }

  /**
   * Upload multiple files sequentially with progress tracking
   */
  async uploadFiles(
    files: Array<{ file: File; fileId: string; fieldName: string }>,
    locumId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: UploadError[] = [];

    for (const { file, fileId, fieldName } of files) {
      try {
        const result = await this.uploadFile(file, fileId, locumId, fieldName, options);
        results.push(result);
      } catch (error) {
        const uploadError: UploadError = {
          fileId,
          fileName: file.name,
          error: (error as Error).message,
          retryCount: options.maxRetries || 3,
          willRetry: false,
        };
        errors.push(uploadError);
      }
    }

    return results;
  }

  /**
   * Cancel an ongoing upload
   */
  cancelUpload(fileId: string): void {
    const controller = this.uploadQueue.get(fileId);
    if (controller) {
      controller.abort();
      this.uploadQueue.delete(fileId);
    }
  }

  /**
   * Cancel all ongoing uploads
   */
  cancelAllUploads(): void {
    this.uploadQueue.forEach((controller) => controller.abort());
    this.uploadQueue.clear();
  }

  private async performUpload(
    file: File,
    filePath: string,
    fileId: string,
    onProgress: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate progress updates during upload
      const progressInterval = setInterval(() => {
        onProgress({
          fileId,
          fileName: file.name,
          progress: Math.min(95, Math.random() * 50 + 30), // Simulate progress
          status: 'uploading',
          retryCount: 0,
        });
      }, 200);

      // Determine if this is a signature upload or document upload
      const isSignatureUpload = filePath.includes('signature') || file.name.includes('signature');
      
      if (isSignatureUpload) {
        // Handle signature upload
        this.performSignatureUpload(file, filePath, fileId, onProgress, progressInterval)
          .then(resolve)
          .catch(reject);
      } else {
        // Handle document upload
        this.performDocumentUpload(file, filePath, fileId, onProgress, progressInterval)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  private async performDocumentUpload(
    file: File,
    filePath: string,
    fileId: string,
    onProgress: (progress: UploadProgress) => void,
    progressInterval: NodeJS.Timeout
  ): Promise<string> {
    // Create FormData for the document upload API call
    const formData = new FormData();
    formData.append('file', file);
    formData.append('locumId', filePath.split('/')[0]); // Extract locumId from filePath
    formData.append('fieldName', filePath.split('/')[1].split('_')[1]); // Extract fieldName from filePath

    // Make API call to our individual document upload endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/locum-profile/upload-single-document`, {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status !== 200) {
      throw new Error(result.error || 'Upload failed');
    }

    onProgress({
      fileId,
      fileName: file.name,
      progress: 100,
      status: 'completed',
      retryCount: 0,
      url: result.fileUrl,
    });

    return result.fileUrl;
  }

  private async performSignatureUpload(
    file: File,
    filePath: string,
    fileId: string,
    onProgress: (progress: UploadProgress) => void,
    progressInterval: NodeJS.Timeout
  ): Promise<string> {
    // Create FormData for the signature upload API call
    const formData = new FormData();
    formData.append('signature', file);
    formData.append('timesheetId', filePath.split('/')[0]); // Extract timesheetId from filePath
    formData.append('signatureType', filePath.split('/')[1].split('_')[0]); // Extract signatureType from filePath

    // Get auth token
    const token = localStorage.getItem('token') || '';

    // Make API call to our signature upload endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/upload-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.data?.signatureUrl) {
      throw new Error('Failed to get signature URL');
    }

    onProgress({
      fileId,
      fileName: file.name,
      progress: 100,
      status: 'completed',
      retryCount: 0,
      url: result.data.signatureUrl,
    });

    return result.data.signatureUrl;
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Upload timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || 'pdf';
  }
}

export const uploadService = UploadService.getInstance();

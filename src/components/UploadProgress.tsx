import React from 'react';
import { UploadProgress as UploadProgressType } from '@/services/uploadService';

interface UploadProgressProps {
  progress: UploadProgressType;
  onCancel?: () => void;
  onRetry?: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  progress, 
  onCancel, 
  onRetry 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'uploading': return 'text-blue-500';
      case 'retrying': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '📤';
      case 'retrying': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'retrying': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon(progress.status)}</span>
          <span className="font-medium text-gray-900 truncate max-w-xs">
            {progress.fileName}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {progress.status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
            >
              Retry
            </button>
          )}
          
          {(progress.status === 'uploading' || progress.status === 'retrying') && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span className={`font-medium ${getStatusColor(progress.status)}`}>
            {progress.status === 'retrying' && progress.retryCount > 0 
              ? `Retrying (${progress.retryCount}/3)`
              : progress.status.charAt(0).toUpperCase() + progress.status.slice(1)
            }
          </span>
          <span className="text-gray-500">
            {progress.progress}%
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.status)}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {progress.error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          <strong>Error:</strong> {progress.error}
        </div>
      )}

      {progress.status === 'completed' && progress.url && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
          <strong>Success:</strong> File uploaded successfully
        </div>
      )}
    </div>
  );
};

export default UploadProgress;

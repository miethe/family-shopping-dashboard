/**
 * ImagePicker Component
 *
 * Comprehensive image selection component supporting multiple input methods:
 * - File upload (click to select)
 * - Drag and drop
 * - Paste from clipboard (Ctrl+V)
 * - URL input for remote images
 *
 * Features:
 * - Image preview
 * - File validation (size, type)
 * - Clear error messages
 * - Mobile-friendly (44px touch targets)
 * - Soft Modernity design system
 */

'use client';

import * as React from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { Upload, Link, Image as ImageIcon, X, AlertCircle } from './icons';
import { Button } from './button';
import { Input } from './input';
import { uploadApi } from '@/lib/api/upload';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heif', 'image/heic'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface ImagePickerProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

type InputMode = 'file' | 'url';

export function ImagePicker({
  value,
  onChange,
  onError,
  className,
  disabled = false
}: ImagePickerProps) {
  const [inputMode, setInputMode] = React.useState<InputMode>('file');
  const [urlInput, setUrlInput] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Clear error when value changes
  React.useEffect(() => {
    if (value) {
      setError(null);
    }
  }, [value]);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC`;
    }

    // Check file size
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size: ${MAX_SIZE_MB}MB`;
    }

    return null;
  };

  /**
   * Handle error display
   */
  const handleError = React.useCallback((errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  /**
   * Upload file to backend
   */
  const uploadFile = React.useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      handleError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadApi.uploadImage(file);
      onChange(response.image_url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      handleError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, handleError]);

  /**
   * Upload from URL
   */
  const uploadFromUrl = async (url: string) => {
    if (!url.trim()) {
      handleError('Please enter a valid URL');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadApi.uploadImageFromUrl(url.trim());
      onChange(response.image_url);
      setUrlInput('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import image from URL';
      handleError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file selection via input
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  /**
   * Handle click on picker area
   */
  const handleClick = () => {
    if (disabled || isUploading) return;
    if (inputMode === 'file') {
      fileInputRef.current?.click();
    }
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else {
      handleError('Please drop an image file');
    }
  };

  /**
   * Handle paste from clipboard
   */
  const handlePaste = React.useCallback((e: ClipboardEvent) => {
    if (disabled || isUploading || inputMode !== 'file') return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          uploadFile(file);
        }
        break;
      }
    }
  }, [disabled, isUploading, inputMode, uploadFile]);

  /**
   * Add paste event listener when in file mode
   */
  React.useEffect(() => {
    if (inputMode === 'file' && !disabled) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [inputMode, disabled, handlePaste]);

  /**
   * Handle clear/remove image
   */
  const handleClear = () => {
    onChange(null);
    setError(null);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle URL submission
   */
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadFromUrl(urlInput);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={inputMode === 'file' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setInputMode('file')}
          disabled={disabled || isUploading}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button
          type="button"
          variant={inputMode === 'url' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setInputMode('url')}
          disabled={disabled || isUploading}
          className="flex-1"
        >
          <Link className="mr-2 h-4 w-4" />
          URL
        </Button>
      </div>

      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Image Preview or Upload Area */}
      {value ? (
        <div className="relative group">
          <div className="relative rounded-large overflow-hidden border-2 border-border-medium shadow-subtle bg-warm-50">
            <div className="relative w-full" style={{ maxHeight: '384px' }}>
              <NextImage
                src={value}
                alt="Selected image preview"
                width={800}
                height={600}
                className="w-full h-auto max-h-96 object-contain"
                unoptimized // Since these are user-uploaded images from external sources
              />
            </div>
            {!disabled && !isUploading && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'absolute top-2 right-2 p-2 rounded-full',
                  'bg-warm-900/80 text-white hover:bg-warm-900',
                  'transition-all duration-200',
                  'opacity-0 group-hover:opacity-100',
                  'min-h-[44px] min-w-[44px]',
                  'flex items-center justify-center'
                )}
                aria-label="Remove image"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {inputMode === 'file' ? (
            <div
              ref={containerRef}
              onClick={handleClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-h-[200px] p-6',
                'border-2 border-dashed rounded-large',
                'transition-all duration-200',
                'cursor-pointer',
                // Base state
                'border-border-medium bg-warm-50 hover:bg-warm-100',
                // Dragging state
                isDragging && 'border-primary-500 bg-primary-50',
                // Disabled state
                (disabled || isUploading) && 'cursor-not-allowed opacity-50',
                // Loading state
                isUploading && 'cursor-wait'
              )}
            >
              <ImageIcon className="h-12 w-12 text-warm-400 mb-4" />
              <p className="text-base font-semibold text-warm-900 mb-2 text-center">
                {isUploading ? 'Uploading...' : 'Drop image here, paste, or click to upload'}
              </p>
              <p className="text-xs text-warm-600 text-center">
                JPEG, PNG, WebP, GIF, HEIF/HEIC up to {MAX_SIZE_MB}MB
              </p>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled || isUploading}
                className="w-full"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={disabled || isUploading || !urlInput.trim()}
                isLoading={isUploading}
                className="w-full"
              >
                Import from URL
              </Button>
            </form>
          )}
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 rounded-medium bg-status-warning-50 border border-status-warning-200 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-status-warning-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-status-warning-700">{error}</p>
        </div>
      )}
    </div>
  );
}

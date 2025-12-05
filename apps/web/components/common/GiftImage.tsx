/**
 * GiftImage Component
 *
 * A robust image component that gracefully handles loading errors by:
 * - Displaying a placeholder when image fails to load
 * - Showing a gift icon fallback on error
 * - Managing loading states
 * - Supporting both Next.js Image and standard img usage
 *
 * Usage:
 *   <GiftImage src={url} alt="Gift name" className="w-full h-full" />
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GiftImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  draggable?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function GiftImage({
  src,
  alt,
  className,
  fallbackClassName,
  width,
  height,
  fill,
  sizes,
  priority,
  unoptimized = true,
  draggable = false,
  onLoad,
  onError,
}: GiftImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Show fallback if no src or error occurred
  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          fallbackClassName || className
        )}
      >
        <span className="material-symbols-outlined text-4xl text-purple-200 dark:text-purple-700">
          redeem
        </span>
      </div>
    );
  }

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width ?? height ?? 400}
      height={fill ? undefined : height ?? width ?? 400}
      fill={fill || (!width && !height)}
      sizes={sizes ?? (fill || (!width && !height) ? '100vw' : undefined)}
      priority={priority}
      className={cn(className, isLoading && 'opacity-0 transition-opacity duration-300')}
      unoptimized={unoptimized}
      draggable={draggable}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}

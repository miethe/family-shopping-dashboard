import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'relative overflow-hidden bg-warm-100 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-warm-50 before:to-transparent',
  {
    variants: {
      variant: {
        default: 'rounded-medium',
        text: 'rounded-small h-4',
        avatar: 'rounded-full',
        button: 'rounded-large h-11',
        card: 'rounded-xlarge',
        image: 'rounded-large aspect-square',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

// Preset skeleton components for common patterns
export function SkeletonCard() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton variant="image" className="w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  return <Skeleton variant="avatar" className={sizeClasses[size]} />;
}

export function SkeletonButton() {
  return <Skeleton variant="button" className="w-24" />;
}

/**
 * Pre-composed skeleton variants for common use cases (legacy support)
 */
export const SkeletonText = ({ className, ...props }: SkeletonProps) => (
  <Skeleton variant="text" className={cn('w-full', className)} {...props} />
);

export const SkeletonCircle = ({ className, ...props }: SkeletonProps) => (
  <Skeleton variant="avatar" className={cn('h-12 w-12', className)} {...props} />
);

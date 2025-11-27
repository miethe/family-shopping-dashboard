import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

/**
 * Pre-composed skeleton variants for common use cases
 */
export const SkeletonText = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-4 w-full', className)} {...props} />
);

export const SkeletonCircle = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-12 w-12 rounded-full', className)} {...props} />
);

export const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('space-y-3', className)} {...props}>
    <Skeleton className="h-[200px] w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
);

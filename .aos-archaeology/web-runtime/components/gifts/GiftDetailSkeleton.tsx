'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Gift Detail Skeleton
 *
 * Loading state for GiftDetail component
 */
export function GiftDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square rounded-lg" />

      {/* Info Skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Title */}
          <Skeleton className="h-8 w-3/4" />

          {/* Price */}
          <Skeleton className="h-10 w-32" />

          {/* Link */}
          <Skeleton className="h-6 w-48" />

          {/* Badge */}
          <Skeleton className="h-6 w-24" />

          {/* Date */}
          <div className="pt-2 border-t border-gray-200">
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

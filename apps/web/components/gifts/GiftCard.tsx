'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { GiftIcon } from '@/components/layout/icons';
import type { Gift } from '@/types';

export interface GiftCardProps {
  gift: Gift;
}

/**
 * Gift Card Component
 *
 * Displays a gift with image, name, price, and source badge.
 * Mobile-optimized with responsive design and touch targets.
 */
export function GiftCard({ gift }: GiftCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/gifts/${gift.id}`} className="block">
        {/* Image */}
        {gift.image_url ? (
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={gift.image_url}
              alt={gift.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            <GiftIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium line-clamp-2 min-h-[48px] text-sm md:text-base">
            {gift.name}
          </h3>

          <div className="flex items-center justify-between mt-2 gap-2">
            {gift.price !== null && gift.price !== undefined ? (
              <span className="text-lg font-bold text-primary-600">
                ${gift.price.toFixed(2)}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">No price</span>
            )}

            {gift.source && (
              <Badge variant="default" className="text-xs">
                {gift.source}
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, StatusPill, Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';
import { GiftIcon } from '@/components/layout/icons';
import { formatPrice } from '@/lib/utils';
import type { Gift } from '@/types';
import type { GiftStatus } from '@/components/ui/status-pill';

export interface GiftCardProps {
  gift: Gift & {
    status?: GiftStatus;
    assignee?: {
      name: string;
      avatarUrl?: string;
    };
  };
}

/**
 * Gift Card Component
 *
 * Displays a gift with image, title, status, price, and assignee.
 * Mobile-optimized with Soft Modernity design system.
 * Uses Card with interactive variant for hover effects.
 */
export function GiftCard({ gift }: GiftCardProps) {
  return (
    <Card variant="interactive" padding="none">
      <Link href={`/gifts/${gift.id}`} className="block">
        <div className="p-4">
          {/* Image */}
          <div className="aspect-square rounded-large overflow-hidden bg-warm-100 mb-3">
            {gift.image_url ? (
              <Image
                src={gift.image_url}
                alt={gift.name}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GiftIcon className="w-10 h-10 text-warm-300" />
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-warm-900 line-clamp-2 mb-2">
            {gift.name}
          </h3>

          {/* Status Pill */}
          {gift.status && (
            <StatusPill status={gift.status} size="sm" className="mb-2" />
          )}

          {/* Footer: Price + Assignee */}
          <div className="flex items-center justify-between mt-3">
            {gift.price !== null && gift.price !== undefined ? (
              <span className="text-sm font-semibold text-primary-600">
                ${formatPrice(gift.price)}
              </span>
            ) : (
              <span className="text-sm text-warm-400">No price</span>
            )}

            {gift.assignee && (
              <div className="flex items-center gap-1.5">
                <Avatar size="xs">
                  <AvatarImage
                    src={gift.assignee.avatarUrl}
                    alt={gift.assignee.name}
                  />
                  <AvatarFallback>
                    {getInitials(gift.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-warm-600">
                  {gift.assignee.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

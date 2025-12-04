'use client';

import { GiftCard } from './GiftCard';
import type { Gift } from '@/types';

export interface GiftGridProps {
  gifts: Gift[];
}

/**
 * Gift Grid Component
 *
 * Responsive grid of gift cards.
 * 2 columns on mobile, 3 on tablet, 4 on desktop.
 */
export function GiftGrid({ gifts }: GiftGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {gifts.map((gift) => (
        <GiftCard key={gift.id} gift={gift} />
      ))}
    </div>
  );
}

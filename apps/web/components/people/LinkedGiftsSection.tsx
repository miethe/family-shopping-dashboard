'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Gift as GiftIcon, Plus } from '@/components/ui/icons';
import { useGiftsByPerson } from '@/hooks/useGifts';
import { formatPrice, cn } from '@/lib/utils';
import type { Gift } from '@/types';
import { useRouter } from 'next/navigation';

interface LinkedGiftsSectionProps {
  personId: number;
  onOpenGiftDetail?: (giftId: string) => void;
}

/**
 * Linked Gifts Section Component
 *
 * Displays gifts linked to a person, grouped by purchase status.
 * - Pending Gifts: purchase_date is null
 * - Purchased Gifts: purchase_date is set
 *
 * Features:
 * - Mini gift cards (48x48 thumbnail, name, price)
 * - Click to open GiftDetailModal
 * - Add Gift button (pre-selects this person)
 * - Loading and empty states
 * - Mobile responsive grid
 */
export function LinkedGiftsSection({
  personId,
  onOpenGiftDetail,
}: LinkedGiftsSectionProps) {
  const router = useRouter();
  const { data: giftsData, isLoading } = useGiftsByPerson(personId);

  // Group gifts by purchase status
  const { pendingGifts, purchasedGifts } = React.useMemo(() => {
    const gifts = giftsData?.items || [];
    const pending: Gift[] = [];
    const purchased: Gift[] = [];

    gifts.forEach((gift) => {
      if (gift.purchase_date) {
        purchased.push(gift);
      } else {
        pending.push(gift);
      }
    });

    return {
      pendingGifts: pending,
      purchasedGifts: purchased,
    };
  }, [giftsData?.items]);

  const handleAddGift = () => {
    // Navigate to new gift page with person pre-selected
    router.push(`/gifts/new?person_id=${personId}`);
  };

  const handleGiftClick = (giftId: number) => {
    if (onOpenGiftDetail) {
      onOpenGiftDetail(String(giftId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  const hasGifts = pendingGifts.length > 0 || purchasedGifts.length > 0;

  return (
    <div className="space-y-6">
      {/* Pending Gifts Section */}
      {pendingGifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-warm-900 uppercase tracking-wide">
            Pending Gifts ({pendingGifts.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pendingGifts.map((gift) => (
              <MiniGiftCard
                key={gift.id}
                gift={gift}
                onClick={() => handleGiftClick(gift.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Purchased Gifts Section */}
      {purchasedGifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-warm-900 uppercase tracking-wide">
            Purchased Gifts ({purchasedGifts.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {purchasedGifts.map((gift) => (
              <MiniGiftCard
                key={gift.id}
                gift={gift}
                onClick={() => handleGiftClick(gift.id)}
                isPurchased
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasGifts && (
        <div className="bg-warm-50 rounded-xl p-12 border border-warm-200 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-warm-100 rounded-full p-4 mb-4">
              <GiftIcon className="h-8 w-8 text-warm-400" />
            </div>
            <h4 className="font-semibold text-warm-900 text-base mb-1">
              No Gifts Yet
            </h4>
            <p className="text-warm-600 text-sm mb-4">
              No gifts have been linked to this person yet
            </p>
          </div>
        </div>
      )}

      {/* Add Gift Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={handleAddGift}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Gift
        </Button>
      </div>
    </div>
  );
}

/**
 * Mini Gift Card
 *
 * Compact gift card for displaying in grids.
 * Shows thumbnail (48x48), name (2 line clamp), and price.
 */
interface MiniGiftCardProps {
  gift: Gift;
  onClick: () => void;
  isPurchased?: boolean;
}

function MiniGiftCard({ gift, onClick, isPurchased = false }: MiniGiftCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:border-primary-400 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'bg-white border-warm-200',
        'min-h-[44px]'
      )}
    >
      <div className="space-y-2">
        {/* Image */}
        <div className="aspect-square rounded-md overflow-hidden bg-warm-100">
          {gift.image_url ? (
            <Image
              src={gift.image_url}
              alt={gift.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-warm-300" />
            </div>
          )}
        </div>

        {/* Name */}
        <h4 className="text-sm font-medium text-warm-900 line-clamp-2 min-h-[2.5rem]">
          {gift.name}
        </h4>

        {/* Price */}
        <div className="flex items-center justify-between">
          {gift.price !== null && gift.price !== undefined ? (
            <span className={cn(
              'text-sm font-semibold',
              isPurchased ? 'text-warm-600' : 'text-primary-600'
            )}>
              ${formatPrice(gift.price)}
            </span>
          ) : (
            <span className="text-xs text-warm-400">No price</span>
          )}
          {isPurchased && (
            <span className="text-xs text-green-600 font-medium">Purchased</span>
          )}
        </div>
      </div>
    </button>
  );
}

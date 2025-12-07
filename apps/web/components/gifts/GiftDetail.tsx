'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GiftIcon } from '@/components/layout/icons';
import { GiftTitleLink } from '@/components/common/GiftTitleLink';
import { formatPrice } from '@/lib/utils';
import type { Gift } from '@/types';

export interface GiftDetailProps {
  gift: Gift;
}

/**
 * Gift Detail Component
 *
 * Displays detailed information about a gift including:
 * - Large image or placeholder
 * - Name and price
 * - External link to URL
 * - Source badge
 * - Created date
 */
export function GiftDetail({ gift }: GiftDetailProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Image */}
      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
        {gift.image_url ? (
          <Image
            src={gift.image_url}
            alt={gift.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GiftIcon className="w-24 h-24 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            <GiftTitleLink name={gift.name} url={gift.url} showExternalIcon />
          </h1>

          {gift.price !== undefined && gift.price !== null && (
            <p className="text-3xl font-bold text-primary-600">
              ${formatPrice(gift.price)}
            </p>
          )}

          {gift.url && (
            <a
              href={gift.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                text-primary-600 hover:text-primary-700
                hover:underline
                min-h-touch
                transition-colors
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View on {gift.source || 'website'}</span>
            </a>
          )}

          {gift.source && (
            <div>
              <Badge variant="info">{gift.source}</Badge>
            </div>
          )}

          <p className="text-sm text-gray-500 pt-2 border-t border-gray-200">
            Added {formatDate(gift.created_at)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

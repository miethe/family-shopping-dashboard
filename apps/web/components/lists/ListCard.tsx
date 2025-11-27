/**
 * ListCard Component
 *
 * Card display for a gift list with type badge, visibility indicator, and link to detail.
 * Mobile-first with 44px touch targets.
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HeartIcon,
  LightbulbIcon,
  CheckIcon,
  ChevronRightIcon,
  EyeOffIcon,
  GlobeIcon,
  UsersIcon,
} from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import type { GiftList, ListType } from '@/types';

interface ListCardProps {
  list: GiftList;
}

// Icon mapping by list type
const listTypeIcons: Record<ListType, typeof HeartIcon> = {
  wishlist: HeartIcon,
  ideas: LightbulbIcon,
  assigned: CheckIcon,
};

// Color scheme by list type
const listTypeColors: Record<ListType, string> = {
  wishlist: 'bg-purple-100 text-purple-600',
  ideas: 'bg-yellow-100 text-yellow-600',
  assigned: 'bg-blue-100 text-blue-600',
};

// Badge variant by list type
const listTypeBadgeVariant: Record<ListType, 'default' | 'success' | 'warning' | 'info'> = {
  wishlist: 'default',
  ideas: 'warning',
  assigned: 'info',
};

// Visibility icons
const visibilityIcons = {
  private: EyeOffIcon,
  family: UsersIcon,
  public: GlobeIcon,
};

export function ListCard({ list }: ListCardProps) {
  const IconComponent = listTypeIcons[list.type];

  return (
    <Card variant="interactive" padding="none" className="min-h-[88px]">
      <Link
        href={`/lists/${list.id}`}
        className="block p-4 min-h-[88px]"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Icon + Content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* List Type Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                listTypeColors[list.type]
              )}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            {/* List Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{list.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Type Badge */}
                <Badge variant={listTypeBadgeVariant[list.type]} size="sm">
                  {list.type}
                </Badge>

                {/* Visibility Badge (only if not family) */}
                {list.visibility !== 'family' && (
                  <Badge variant="default" size="sm" className="text-xs">
                    <div className="flex items-center gap-1">
                      {visibilityIcons[list.visibility] &&
                        (() => {
                          const VisibilityIcon = visibilityIcons[list.visibility];
                          return <VisibilityIcon className="w-3 h-3" />;
                        })()}
                      <span>{list.visibility}</span>
                    </div>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Arrow */}
          <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      </Link>
    </Card>
  );
}

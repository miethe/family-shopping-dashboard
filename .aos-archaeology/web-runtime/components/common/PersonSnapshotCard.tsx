'use client';

import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Person } from '@/types';

export interface PersonSnapshotCardProps {
  person: Person;
  giftCount?: number;
  wishlistCount?: number;
  className?: string;
}

/**
 * PersonSnapshotCard Component
 *
 * A lightweight card shown in tooltips, displaying a person's summary info.
 *
 * Features:
 * - Avatar (medium size, 40px)
 * - Full name prominently displayed
 * - Relationship label if set
 * - Gift stats summary (e.g., "5 gifts · 2 wishlists")
 * - Compact design suitable for tooltip content
 *
 * Design follows "Soft Modernity" theme with subtle borders and muted text.
 *
 * @example
 * ```tsx
 * <PersonSnapshotCard
 *   person={person}
 *   giftCount={5}
 *   wishlistCount={2}
 * />
 * ```
 */
export function PersonSnapshotCard({
  person,
  giftCount = 0,
  wishlistCount = 0,
  className,
}: PersonSnapshotCardProps) {
  // Build stats text
  const stats: string[] = [];
  if (giftCount > 0) {
    stats.push(`${giftCount} ${giftCount === 1 ? 'gift' : 'gifts'}`);
  }
  if (wishlistCount > 0) {
    stats.push(`${wishlistCount} ${wishlistCount === 1 ? 'wishlist' : 'wishlists'}`);
  }
  const statsText = stats.join(' · ');

  return (
    <div className={cn('p-3 space-y-2 min-w-[180px] max-w-[220px]', className)}>
      {/* Header: Avatar and Name */}
      <div className="flex items-start gap-3">
        <Avatar size="md" ariaLabel={person.display_name}>
          {person.photo_url && (
            <AvatarImage src={person.photo_url} alt={person.display_name} />
          )}
          <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {person.display_name}
          </p>
          {person.relationship && (
            <p className="text-xs text-muted-foreground truncate">
              {person.relationship}
            </p>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {statsText && (
        <div className="pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground">{statsText}</p>
        </div>
      )}
    </div>
  );
}

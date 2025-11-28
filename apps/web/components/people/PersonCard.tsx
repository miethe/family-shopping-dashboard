'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Person } from '@/types';

export interface PersonCardProps {
  person: Person;
}

/**
 * Person Card Component
 *
 * Displays person summary in a card with:
 * - Avatar (photo or initials fallback)
 * - Display name
 * - Relationship badge
 * - Interests preview (truncated)
 * - Full card is tappable link to detail page
 * - 44px touch target compliance
 */
export function PersonCard({ person }: PersonCardProps) {
  return (
    <Card variant="interactive" padding="none" className="min-h-[44px]">
      <Link
        href={`/people/${person.id}`}
        className="block p-4 min-h-[44px]"
        aria-label={`View details for ${person.name}`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar size="lg" className="flex-shrink-0">
            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name */}
            <h3 className="font-semibold text-lg truncate text-gray-900">
              {person.name}
            </h3>

            {/* Interests Preview */}
            {person.interests && person.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {person.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="info" size="sm">
                    {interest}
                  </Badge>
                ))}
                {person.interests.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{person.interests.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

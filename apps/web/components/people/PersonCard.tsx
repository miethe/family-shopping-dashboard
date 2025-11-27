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
        aria-label={`View details for ${person.display_name}`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar size="lg" className="flex-shrink-0">
            {person.photo_url ? (
              <AvatarImage src={person.photo_url} alt={person.display_name} />
            ) : (
              <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
            )}
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name */}
            <h3 className="font-semibold text-lg truncate text-gray-900">
              {person.display_name}
            </h3>

            {/* Relationship Badge */}
            {person.relationship && (
              <Badge variant="default" size="sm">
                {person.relationship}
              </Badge>
            )}

            {/* Interests Preview */}
            {person.interests && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {person.interests}
              </p>
            )}

            {/* Birthdate (if available) */}
            {person.birthdate && (
              <p className="text-xs text-gray-400">
                Birthday: {new Date(person.birthdate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

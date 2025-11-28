/**
 * PersonDetail Component
 *
 * Header section of person detail page showing avatar, name, and basic info.
 * Mobile-first design with responsive layout.
 */

'use client';

import type { Person } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/components/ui/avatar';

interface PersonDetailProps {
  person: Person;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PersonDetail({ person }: PersonDetailProps) {
  return (
    <Card>
      <div className="flex items-start gap-4 p-6">
        <Avatar size="xl" className="text-xl">
          <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{person.name}</h1>

          <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-gray-500">
            <span>Added {formatDate(person.created_at)}</span>
            {person.updated_at !== person.created_at && (
              <>
                <span>•</span>
                <span>Updated {formatDate(person.updated_at)}</span>
              </>
            )}
          </div>

          {person.interests && person.interests.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {person.interests.map((interest, index) => (
                  <Badge key={index} variant="info" size="sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

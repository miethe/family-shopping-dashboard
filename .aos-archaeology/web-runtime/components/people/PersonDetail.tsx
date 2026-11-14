/**
 * PersonDetail Component
 *
 * Header section of person detail page showing avatar, name, relationship,
 * birthdate, and interests. Mobile-first design with responsive layout.
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

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate: string): number | null {
  try {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
}

/**
 * Get next birthday date
 */
function getNextBirthday(birthdate: string): string | null {
  try {
    const today = new Date();
    const birth = new Date(birthdate);
    const thisYear = today.getFullYear();

    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());

    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }

    return nextBirthday.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export function PersonDetail({ person }: PersonDetailProps) {
  const age = person.birthdate ? calculateAge(person.birthdate) : null;
  const nextBirthday = person.birthdate ? getNextBirthday(person.birthdate) : null;

  return (
    <Card>
      <div className="flex items-start gap-4 p-6">
        <Avatar size="xl" className="text-xl">
          {person.photo_url && <AvatarImage src={person.photo_url} alt={person.display_name} />}
          <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Name and Relationship */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate">{person.display_name}</h1>
            {person.relationship && (
              <div className="mt-1">
                <Badge variant="default">{person.relationship}</Badge>
              </div>
            )}
          </div>

          {/* Birthdate Info */}
          {person.birthdate && (
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Birthday:</span>
                <span>{formatDate(person.birthdate)}</span>
                {age !== null && <span className="text-gray-400">({age} years old)</span>}
              </div>
              {nextBirthday && (
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <span>Next:</span>
                  <span>{nextBirthday}</span>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
            <span>Added {formatDate(person.created_at)}</span>
            {person.updated_at !== person.created_at && (
              <>
                <span>•</span>
                <span>Updated {formatDate(person.updated_at)}</span>
              </>
            )}
          </div>

          {/* Interests */}
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

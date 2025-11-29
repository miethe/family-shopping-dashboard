'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PersonDetailModal, useEntityModal } from '@/components/modals';
import type { Person } from '@/types';

export interface PersonCardProps {
  person: Person;
}

/**
 * Calculate days until next birthday
 */
function getDaysUntilBirthday(birthdate: string): number | null {
  try {
    const today = new Date();
    const birth = new Date(birthdate);
    const thisYear = today.getFullYear();

    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());

    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return null;
  }
}

/**
 * Format birthday message
 */
function formatBirthdayMessage(birthdate: string): string | null {
  const days = getDaysUntilBirthday(birthdate);
  if (days === null) return null;

  if (days === 0) return 'Birthday today!';
  if (days === 1) return 'Birthday tomorrow';
  if (days <= 7) return `Birthday in ${days} days`;
  if (days <= 30) return `Birthday in ${days} days`;

  return null; // Don't show if more than 30 days away
}

/**
 * Person Card Component
 *
 * Displays person summary in a card with:
 * - Avatar (photo or initials fallback)
 * - Display name
 * - Relationship badge
 * - Upcoming birthday notification (if within 30 days)
 * - Interests preview (truncated)
 * - Full card is tappable link to detail page
 * - 44px touch target compliance
 */
export function PersonCard({ person }: PersonCardProps) {
  const birthdayMessage = person.birthdate ? formatBirthdayMessage(person.birthdate) : null;
  const { open, entityId, openModal, closeModal } = useEntityModal('person');

  return (
    <>
      <button
        onClick={() => openModal(String(person.id))}
        className="w-full text-left"
        aria-label={`View details for ${person.display_name}`}
      >
        <Card variant="interactive" padding="none" className="min-h-[44px]">
          <div className="p-4 min-h-[44px]">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar size="lg" className="flex-shrink-0">
                {person.photo_url && <AvatarImage src={person.photo_url} alt={person.display_name} />}
                <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Name and Relationship */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg truncate text-gray-900">
                    {person.display_name}
                  </h3>
                  {person.relationship && (
                    <Badge variant="default" size="sm">
                      {person.relationship}
                    </Badge>
                  )}
                </div>

                {/* Birthday Alert */}
                {birthdayMessage && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <span aria-label="Birthday">🎂</span>
                    <span className="font-medium">{birthdayMessage}</span>
                  </div>
                )}

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
          </div>
        </Card>
      </button>

      <PersonDetailModal
        personId={entityId}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeModal();
        }}
      />
    </>
  );
}

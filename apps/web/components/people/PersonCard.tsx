'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PersonDetailModal, useEntityModal, ListDetailModal } from '@/components/modals';
import { useQuery } from '@tanstack/react-query';
import { listApi } from '@/lib/api/endpoints';
import Link from 'next/link';
import type { Person } from '@/types';

export interface PersonCardProps {
  person: Person;
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
 * Format birthday as "Jan 15"
 */
function formatBirthday(birthdate: string): string | null {
  try {
    const date = new Date(birthdate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
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
 * - Age and birthday display
 * - Gift count (assigned/needed) with navigation
 * - Attached lists with badges
 * - Upcoming birthday notification (if within 30 days)
 * - Interests preview (truncated)
 * - Full card is tappable link to detail page
 * - 44px touch target compliance
 */
export function PersonCard({ person }: PersonCardProps) {
  const birthdayMessage = person.birthdate ? formatBirthdayMessage(person.birthdate) : null;
  const age = person.birthdate ? calculateAge(person.birthdate) : null;
  const formattedBirthday = person.birthdate ? formatBirthday(person.birthdate) : null;

  const { open, entityId, openModal, closeModal } = useEntityModal('person');
  const { open: listModalOpen, entityId: listModalId, openModal: openListModal, closeModal: closeListModal } = useEntityModal('list');

  // Fetch lists for this person
  const { data: listsData, isLoading: listsLoading } = useQuery({
    queryKey: ['lists', 'person', person.id],
    queryFn: () => listApi.list({ person_id: person.id }),
  });

  const lists = listsData?.items || [];

  // Calculate gift counts from lists
  const totalGifts = lists.reduce((sum, list) => sum + (list.item_count || 0), 0);
  const giftsNeeded = lists.length > 0 ? lists.length * 5 : 0; // Placeholder: assume 5 gifts needed per list
  const hasNoGifts = totalGifts === 0 && lists.length > 0;

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

                {/* Age and Birthday */}
                {(age !== null || formattedBirthday) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span aria-label="Birthday">🎂</span>
                    <span>
                      {formattedBirthday}
                      {age !== null && ` • ${age} ${age === 1 ? 'year' : 'years'}`}
                    </span>
                  </div>
                )}

                {/* Birthday Alert */}
                {birthdayMessage && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <span aria-label="Alert">⚠️</span>
                    <span className="font-medium">{birthdayMessage}</span>
                  </div>
                )}

                {/* Gift Count */}
                {lists.length > 0 && (
                  <Link
                    href={`/gifts?recipient=${person.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline ${
                      hasNoGifts ? 'text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    <span aria-label="Gifts">🎁</span>
                    <span>
                      {totalGifts}/{giftsNeeded} gifts
                    </span>
                    {hasNoGifts && (
                      <span className="text-xs">(Add gifts!)</span>
                    )}
                  </Link>
                )}

                {/* Lists Section */}
                {!listsLoading && lists.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-gray-500 font-medium">Lists:</span>
                    {lists.slice(0, 3).map((list) => (
                      <button
                        key={list.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openListModal(String(list.id));
                        }}
                        className="inline-flex items-center"
                        title={list.name}
                      >
                        <Badge variant="info" size="sm" className="hover:bg-blue-100 cursor-pointer">
                          {list.name}
                        </Badge>
                      </button>
                    ))}
                    {lists.length > 3 && (
                      <div className="group relative">
                        <Badge variant="default" size="sm" className="cursor-help">
                          +{lists.length - 3}
                        </Badge>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                          <div className="space-y-1">
                            {lists.slice(3).map((list) => (
                              <div key={list.id} className="truncate">
                                {list.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
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

      <ListDetailModal
        listId={listModalId}
        open={listModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeListModal();
        }}
      />
    </>
  );
}

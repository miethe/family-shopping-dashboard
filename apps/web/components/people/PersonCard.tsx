'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PersonDetailModal, useEntityModal, ListDetailModal } from '@/components/modals';
import { useQuery } from '@tanstack/react-query';
import { listApi } from '@/lib/api/endpoints';
import { getAge, formatDateCustom, getNextBirthday } from '@/lib/date-utils';
import Link from 'next/link';
import type { Person } from '@/types';

export interface PersonCardProps {
  person: Person;
}

/**
 * Format birthday as "Jan 15"
 */
function formatBirthday(birthdate: string): string | null {
  try {
    return formatDateCustom(birthdate, { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

/**
 * Format birthday message
 */
function formatBirthdayMessage(birthdate: string): string | null {
  const nextBirthdayInfo = getNextBirthday(birthdate);
  if (!nextBirthdayInfo) return null;

  const days = nextBirthdayInfo.daysUntil;

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
  const age = person.birthdate ? getAge(person.birthdate) : null;
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
        className="w-full text-left h-full"
        aria-label={`View details for ${person.display_name}`}
      >
        <Card variant="interactive" padding="none" className="min-h-[280px] max-h-[280px] h-full">
          <div className="p-4 h-full flex flex-col overflow-hidden">
            <div className="flex items-start gap-4 flex-shrink-0">
              {/* Avatar */}
              <Avatar size="lg" className="flex-shrink-0">
                {person.photo_url && <AvatarImage src={person.photo_url} alt={person.display_name} />}
                <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
              </Avatar>

              {/* Header: Name and Relationship */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
                  {person.display_name}
                </h3>
                {person.relationship && (
                  <Badge variant="default" size="sm" className="mt-1">
                    {person.relationship}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content - scrollable if needed */}
            <div className="flex-1 min-h-0 space-y-2 mt-3 overflow-y-auto">
              {/* Age and Birthday */}
              {(age !== null || formattedBirthday) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span aria-label="Birthday">🎂</span>
                  <span className="truncate">
                    {formattedBirthday}
                    {age !== null && ` • ${age} ${age === 1 ? 'year' : 'years'}`}
                  </span>
                </div>
              )}

              {/* Birthday Alert */}
              {birthdayMessage && (
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <span aria-label="Alert">⚠️</span>
                  <span className="font-medium truncate">{birthdayMessage}</span>
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
                  <span className="truncate">
                    {totalGifts}/{giftsNeeded} gifts
                  </span>
                  {hasNoGifts && (
                    <span className="text-xs whitespace-nowrap">(Add gifts!)</span>
                  )}
                </Link>
              )}

              {/* Lists Section */}
              {!listsLoading && lists.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-gray-500 font-medium flex-shrink-0">Lists:</span>
                  {lists.slice(0, 2).map((list) => (
                    <button
                      key={list.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openListModal(String(list.id));
                      }}
                      className="inline-flex items-center flex-shrink-0"
                      title={list.name}
                    >
                      <Badge variant="info" size="sm" className="hover:bg-blue-100 cursor-pointer line-clamp-1 max-w-[100px]">
                        {list.name}
                      </Badge>
                    </button>
                  ))}
                  {lists.length > 2 && (
                    <div className="group relative flex-shrink-0">
                      <Badge variant="default" size="sm" className="cursor-help">
                        +{lists.length - 2}
                      </Badge>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        <div className="space-y-1">
                          {lists.slice(2).map((list) => (
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
                  {person.interests.slice(0, 2).map((interest, index) => (
                    <Badge key={index} variant="info" size="sm" className="line-clamp-1 max-w-[120px]">
                      {interest}
                    </Badge>
                  ))}
                  {person.interests.length > 2 && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      +{person.interests.length - 2} more
                    </span>
                  )}
                </div>
              )}

              {/* Groups Preview */}
              {person.groups && person.groups.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium flex-shrink-0">Groups:</span>
                  <div className="flex gap-1.5">
                    {person.groups.slice(0, 3).map(group => (
                      <span
                        key={group.id}
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color || '#9CA3AF' }}
                        title={group.name}
                      />
                    ))}
                    {person.groups.length > 3 && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        +{person.groups.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
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

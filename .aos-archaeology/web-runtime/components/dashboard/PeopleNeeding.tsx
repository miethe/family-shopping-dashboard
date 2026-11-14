/**
 * People Needing Gifts
 *
 * List of people who need more gifts with pending counts.
 */

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';
import type { PersonSummaryDashboard } from '@/types';

interface PeopleNeedingProps {
  people: PersonSummaryDashboard[];
}

/**
 * Format a date string for display (MMM DD format)
 */
function formatOccasionDate(dateString?: string): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

export function PeopleNeeding({ people }: PeopleNeedingProps) {
  return (
    <div>
      <Card className="border-warm-200 lift-effect">
        <CardHeader>
          <CardTitle>People Needing Gifts</CardTitle>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <p className="text-warm-600 text-center py-4">Everyone is covered!</p>
          ) : (
            <ul className="space-y-3">
              {people.map((person) => {
                const occasionDate = formatOccasionDate(person.next_occasion);

                return (
                  <li key={person.id}>
                    <Link
                      href={`/people/${person.id}`}
                      className="block p-3 rounded-lg hover:bg-warm-50 min-h-[44px] transition-all hover:translate-x-1 no-underline group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar with photo support */}
                        <Avatar size="md" className="flex-shrink-0">
                          {person.photo_url && (
                            <AvatarImage src={person.photo_url} alt={person.display_name} />
                          )}
                          <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Date */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-warm-900 truncate group-hover:text-primary-600 transition-colors">
                              {person.display_name}
                            </h3>
                            {occasionDate && (
                              <span className="text-xs font-medium text-warm-600 bg-warm-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {occasionDate}
                              </span>
                            )}
                          </div>

                          {/* Gift Counts */}
                          <div className="flex items-center gap-3 text-xs">
                            {person.gift_counts.idea > 0 && (
                              <span className="flex items-center gap-1 text-status-idea-700">
                                <span className="text-sm" aria-label="Ideas">💡</span>
                                <span className="font-medium">{person.gift_counts.idea}</span>
                              </span>
                            )}
                            {person.gift_counts.needed > 0 && (
                              <span className="flex items-center gap-1 text-status-needed-700">
                                <span className="text-sm" aria-label="Needed">✓</span>
                                <span className="font-medium">{person.gift_counts.needed}</span>
                              </span>
                            )}
                            {person.gift_counts.purchased > 0 && (
                              <span className="flex items-center gap-1 text-status-success-700">
                                <span className="text-sm" aria-label="Purchased">🎁</span>
                                <span className="font-medium">{person.gift_counts.purchased}</span>
                              </span>
                            )}
                            {person.gift_counts.idea === 0 &&
                             person.gift_counts.needed === 0 &&
                             person.gift_counts.purchased === 0 && (
                              <span className="text-warm-500 italic">No gifts yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * People Needing Gifts
 *
 * List of people who need more gifts with pending counts.
 */

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Avatar, AvatarFallback, Badge, getInitials } from '@/components/ui';
import type { PersonSummaryDashboard } from '@/types';

interface PeopleNeedingProps {
  people: PersonSummaryDashboard[];
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
            <ul className="space-y-2">
              {people.map((person) => (
                <li key={person.id}>
                  <Link
                    href={`/people/${person.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-warm-50 min-h-[44px] transition-all hover:translate-x-1 no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-warm-900">{person.display_name}</span>
                    </div>
                    <Badge variant="info">
                      {person.pending_gifts} pending
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * PersonInfo Component
 *
 * Info tab displaying person details: interests, sizes, birthdate, and notes.
 * Shows structured data in a clean, scannable format.
 */

'use client';

import type { Person } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface PersonInfoProps {
  person: Person;
}

export function PersonInfo({ person }: PersonInfoProps) {
  const hasInterests = person.interests && person.interests.trim().length > 0;
  const hasSizes = person.sizes && Object.keys(person.sizes).length > 0;
  const hasNotes = person.notes && person.notes.trim().length > 0;
  const hasBirthdate = person.birthdate;

  // Show message if no data
  if (!hasInterests && !hasSizes && !hasNotes && !hasBirthdate) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p>No additional information available for this person.</p>
          <p className="mt-2 text-sm">Use the Edit button to add interests, sizes, or notes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {hasBirthdate && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Birthday
            </h3>
            <p className="text-gray-900">
              {new Date(person.birthdate!).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </section>
        )}

        {hasInterests && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Interests
            </h3>
            <p className="text-gray-900 whitespace-pre-wrap">{person.interests}</p>
          </section>
        )}

        {hasSizes && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Sizes
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(person.sizes!).map(([key, value]) => (
                <div key={key} className="flex items-baseline justify-between sm:block">
                  <dt className="text-gray-500 capitalize text-sm">{key}</dt>
                  <dd className="font-medium text-gray-900 sm:mt-1">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {hasNotes && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Notes
            </h3>
            <p className="text-gray-900 whitespace-pre-wrap">{person.notes}</p>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

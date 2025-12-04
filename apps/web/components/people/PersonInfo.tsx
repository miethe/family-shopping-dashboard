/**
 * PersonInfo Component
 *
 * Info tab displaying person details: notes, constraints, interests, and sizes.
 * Shows structured data in a clean, scannable format with all PRD fields.
 */

'use client';

import type { Person } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PersonInfoProps {
  person: Person;
}

export function PersonInfo({ person }: PersonInfoProps) {
  const hasNotes = person.notes && person.notes.trim();
  const hasConstraints = person.constraints && person.constraints.trim();
  const hasInterests = person.interests && person.interests.length > 0;
  const hasSizes = person.sizes && Object.keys(person.sizes).length > 0;

  // Show message if no data
  if (!hasNotes && !hasConstraints && !hasInterests && !hasSizes) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p>No additional information available for this person.</p>
          <p className="mt-2 text-sm">Use the Edit button to add details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {/* Notes Section */}
        {hasNotes && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Notes
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{person.notes}</p>
          </section>
        )}

        {/* Gift Constraints Section */}
        {hasConstraints && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Gift Constraints
            </h3>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-gray-800 whitespace-pre-wrap">{person.constraints}</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Important considerations when selecting gifts
            </p>
          </section>
        )}

        {/* Interests Section */}
        {hasInterests && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {person.interests!.map((interest, index) => (
                <Badge key={index} variant="info">
                  {interest}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Sizes Section */}
        {hasSizes && (
          <section>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">
              Sizes
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(person.sizes!).map(([key, value]) => (
                <div key={key} className="flex items-baseline justify-between sm:block p-3 bg-gray-50 rounded-md">
                  <dt className="text-gray-500 capitalize text-sm font-medium">{key}</dt>
                  <dd className="font-semibold text-gray-900 sm:mt-1 text-lg">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

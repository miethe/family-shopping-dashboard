/**
 * OccasionList Component
 *
 * Displays a grid/list of occasion cards.
 * Handles empty state gracefully.
 */

'use client';

import { OccasionCard } from './OccasionCard';
import type { Occasion } from '@/types';

interface OccasionListProps {
  occasions: Occasion[];
}

export function OccasionList({ occasions }: OccasionListProps) {
  if (occasions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No occasions found</p>
        <p className="text-gray-400 text-sm mt-2">
          Create your first occasion to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {occasions.map((occasion) => (
        <OccasionCard key={occasion.id} occasion={occasion} />
      ))}
    </div>
  );
}

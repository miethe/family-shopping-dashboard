/**
 * Primary Occasion Card
 *
 * Hero card showing the next upcoming occasion with countdown and progress.
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import type { DashboardOccasionSummary } from '@/types';

interface PrimaryOccasionProps {
  occasion: DashboardOccasionSummary;
}

export function PrimaryOccasion({ occasion }: PrimaryOccasionProps) {
  const progress = occasion.total_items > 0
    ? (occasion.purchased_items / occasion.total_items) * 100
    : 0;

  // Format date as "Dec 25, 2025"
  const formattedDate = new Date(occasion.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      <Link href={`/occasions/${occasion.id}`}>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer lift-effect">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{occasion.name}</h2>
                <p className="text-blue-100 text-sm mt-1">{formattedDate}</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold block">{occasion.days_until}</span>
                <p className="text-blue-100 text-sm">
                  {occasion.days_until === 1 ? 'day left' : 'days left'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress</span>
                <span className="text-blue-100">
                  {occasion.purchased_items}/{occasion.total_items} purchased
                </span>
              </div>
              <div className="h-2 bg-blue-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

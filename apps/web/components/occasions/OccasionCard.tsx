/**
 * OccasionCard Component
 *
 * Displays an individual occasion with:
 * - Type icon with color coding
 * - Name and date
 * - Days until/ago countdown
 * - Type badge
 * - Link to detail page
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CakeIcon, HeartIcon, SparklesIcon } from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import type { Occasion } from '@/types';

interface OccasionCardProps {
  occasion: Occasion;
}

// Type-specific colors
const typeColors: Record<string, string> = {
  birthday: 'bg-purple-100 text-purple-600',
  holiday: 'bg-red-100 text-red-600',
  other: 'bg-gray-100 text-gray-600',
};

// Type-specific badge variants
const typeBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
  birthday: 'primary',
  holiday: 'error',
  other: 'default',
};

// Type icons
function OccasionIcon({ type, className }: { type: string; className?: string }) {
  const iconClass = className || 'w-6 h-6';

  switch (type) {
    case 'birthday':
      return <CakeIcon className={iconClass} />;
    case 'holiday':
      return <SparklesIcon className={iconClass} />;
    default:
      return <CalendarIcon className={iconClass} />;
  }
}

// Calculate days until/since occasion
function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = date.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format date for display
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OccasionCard({ occasion }: OccasionCardProps) {
  const daysUntil = getDaysUntil(occasion.date);
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;

  return (
    <Link href={`/occasions/${occasion.id}`} className="block">
      <Card variant="interactive" padding="default">
        <div className="flex items-center gap-4">
          {/* Type Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
              typeColors[occasion.type] || typeColors.other
            )}
          >
            <OccasionIcon type={occasion.type} className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{occasion.name}</h3>
              <Badge variant={typeBadgeVariant[occasion.type] || 'default'} size="sm">
                {occasion.type}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm">{formatDate(occasion.date)}</p>
          </div>

          {/* Days Badge */}
          <div className="text-right flex-shrink-0">
            {isToday ? (
              <div className="text-center">
                <span className="text-lg font-bold text-blue-600">Today</span>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className={cn(
                    'text-lg font-bold',
                    isPast ? 'text-gray-400' : 'text-blue-600'
                  )}
                >
                  {Math.abs(daysUntil)}
                </span>
                <p className="text-xs text-gray-500">
                  {isPast ? 'days ago' : 'days left'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

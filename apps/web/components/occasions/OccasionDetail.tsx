/**
 * OccasionDetail Component
 *
 * Hero card displaying full occasion details:
 * - Type icon with color coding
 * - Name, date, and description
 * - Days until/ago countdown with visual emphasis
 * - Type badge
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CakeIcon, SparklesIcon } from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import type { Occasion } from '@/types';

interface OccasionDetailProps {
  occasion: Occasion;
}

// Type-specific colors for icon background
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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OccasionDetail({ occasion }: OccasionDetailProps) {
  const daysUntil = getDaysUntil(occasion.date);
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;

  return (
    <Card variant="elevated" padding="none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Icon and Main Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Type Icon */}
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0',
                typeColors[occasion.type] || typeColors.other
              )}
            >
              <OccasionIcon type={occasion.type} className="w-8 h-8" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={typeBadgeVariant[occasion.type] || 'default'} size="sm">
                  {occasion.type}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{occasion.name}</h2>
              <p className="text-gray-600">{formatDate(occasion.date)}</p>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="text-right flex-shrink-0">
            {isToday ? (
              <div className="text-center">
                <span className="block text-4xl font-bold text-blue-600">Today</span>
                <p className="text-sm text-gray-500 mt-1">is the day!</p>
              </div>
            ) : (
              <div className="text-center">
                <span
                  className={cn(
                    'block text-4xl font-bold',
                    isPast ? 'text-gray-400' : 'text-primary-600'
                  )}
                >
                  {Math.abs(daysUntil)}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {isPast ? 'days ago' : 'days left'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {occasion.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{occasion.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

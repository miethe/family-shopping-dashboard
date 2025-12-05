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

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CakeIcon, HeartIcon, SparklesIcon } from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import { OccasionDetailModal, useEntityModal } from '@/components/modals';
import { getDaysUntil, formatDateCustom } from '@/lib/date-utils';
import type { Occasion, OccasionType } from '@/types';

interface OccasionCardProps {
  occasion: Occasion;
}

// Type-specific colors
const typeColors: Record<string, string> = {
  birthday: 'bg-purple-100 text-purple-600',
  holiday: 'bg-red-100 text-red-600',
  recurring: 'bg-blue-100 text-blue-600',
  other: 'bg-gray-100 text-gray-600',
};

// Type-specific badge variants
const typeBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
  birthday: 'primary',
  holiday: 'error',
  recurring: 'primary',
  other: 'default',
};

// Helper function to format occasion type for display
function formatOccasionType(type: OccasionType): string {
  switch (type) {
    case 'holiday':
      return 'Holiday';
    case 'recurring':
      return 'Recurring';
    case 'other':
      return 'Other';
    default:
      return type;
  }
}

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

export function OccasionCard({ occasion }: OccasionCardProps) {
  // Use next_occurrence if available, otherwise use date
  const displayDate = occasion.next_occurrence || occasion.date;
  const daysUntil = getDaysUntil(displayDate);
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;
  const { open, entityId, openModal, closeModal } = useEntityModal('occasion');

  return (
    <>
      <button
        onClick={() => openModal(String(occasion.id))}
        className="w-full text-left"
      >
        <Card variant="interactive" padding="default">
          <div className="flex flex-col gap-3">
            {/* Header with Icon and Badges */}
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
                <h3 className="font-semibold text-gray-900 truncate mb-2">{occasion.name}</h3>

                {/* Type/Recurrence badges */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant={typeBadgeVariant[occasion.type] || 'default'} size="sm">
                    {occasion.type === 'recurring' && '🔄 '}
                    {formatOccasionType(occasion.type)}
                  </Badge>
                  {occasion.subtype && (
                    <Badge variant="default" size="sm">
                      {occasion.subtype}
                    </Badge>
                  )}
                  {!occasion.is_active && (
                    <Badge variant="warning" size="sm">
                      Inactive
                    </Badge>
                  )}
                </div>
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
                        isPast ? 'text-gray-400' :
                        daysUntil <= 7 ? 'text-orange-600' :
                        daysUntil <= 3 ? 'text-red-600' :
                        'text-blue-600'
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

            {/* Date Display */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {formatDateCustom(displayDate, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {daysUntil > 0 && (
                <span
                  className={cn(
                    'font-medium',
                    daysUntil <= 7 && 'text-orange-600',
                    daysUntil <= 3 && 'text-red-600'
                  )}
                >
                  {daysUntil === 0 ? '• Today!' :
                   daysUntil === 1 ? '• Tomorrow' :
                   `• in ${daysUntil} days`}
                </span>
              )}
            </div>

            {/* Show "Next:" label for recurring occasions */}
            {occasion.type === 'recurring' && occasion.next_occurrence && (
              <div className="text-xs text-gray-500 bg-blue-50 rounded px-2 py-1 border border-blue-100">
                Next occurrence: {formatDateCustom(occasion.next_occurrence, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
        </Card>
      </button>

      <OccasionDetailModal
        occasionId={entityId}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeModal();
        }}
      />
    </>
  );
}

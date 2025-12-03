/**
 * GiftGroupedView Component
 *
 * Displays gifts grouped by status in collapsible sections.
 * Similar to Kanban columns but in a more compact section-based layout.
 *
 * Features:
 * - Collapsible sections with smooth animations
 * - Responsive grid (2 cols mobile, 3 tablet, 4 desktop)
 * - Status icons and count badges
 * - Glassmorphism styling matching Soft Modernity design
 */

'use client';

import { useMemo, useState } from 'react';
import { GiftCard } from './GiftCard';
import { Icon } from '@/components/ui/icon';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Gift } from '@/types';
import type { GiftStatus } from '@/components/ui/status-pill';

export interface GiftGroupedViewProps {
  gifts: Array<Gift & {
    status?: GiftStatus;
    assignee?: {
      name: string;
      avatarUrl?: string;
    };
  }>;
  groupBy?: 'status' | 'recipient';
  emptyMessage?: string;
  hideEmptySections?: boolean;
}

// Status configuration with icons and colors
const STATUS_CONFIG: Record<string, {
  label: string;
  icon: string;
  color: string;
}> = {
  idea: {
    label: 'Ideas',
    icon: 'lightbulb',
    color: 'text-status-idea-600',
  },
  shortlisted: {
    label: 'Shortlisted',
    icon: 'star',
    color: 'text-status-idea-600',
  },
  buying: {
    label: 'Buying',
    icon: 'shopping_cart',
    color: 'text-status-progress-600',
  },
  ordered: {
    label: 'Ordered',
    icon: 'local_shipping',
    color: 'text-status-progress-600',
  },
  purchased: {
    label: 'Purchased',
    icon: 'shopping_bag',
    color: 'text-status-success-600',
  },
  delivered: {
    label: 'Delivered',
    icon: 'package',
    color: 'text-status-success-600',
  },
  gifted: {
    label: 'Gifted',
    icon: 'card_giftcard',
    color: 'text-status-success-600',
  },
  urgent: {
    label: 'Urgent',
    icon: 'priority_high',
    color: 'text-status-warning-600',
  },
};

// Define section order for display
const STATUS_ORDER: string[] = [
  'idea',
  'shortlisted',
  'buying',
  'ordered',
  'purchased',
  'delivered',
  'gifted',
  'urgent',
];

/**
 * Group gifts by status
 */
function groupByStatus(gifts: GiftGroupedViewProps['gifts']): Record<string, GiftGroupedViewProps['gifts']> {
  const result: Record<string, GiftGroupedViewProps['gifts']> = {};

  // Initialize all status groups
  STATUS_ORDER.forEach(status => {
    result[status] = [];
  });

  // Group gifts by status
  gifts.forEach(gift => {
    const status = gift.status || 'idea';
    if (result[status]) {
      result[status].push(gift);
    }
  });

  return result;
}

/**
 * GiftGroupedView
 *
 * Displays gifts in collapsible sections grouped by status.
 */
export function GiftGroupedView({
  gifts,
  groupBy = 'status',
  emptyMessage = 'No gifts found',
  hideEmptySections = true,
}: GiftGroupedViewProps) {
  // Group gifts by status
  const groupedGifts = useMemo(() => {
    if (groupBy === 'status') {
      return groupByStatus(gifts);
    }
    // Future: implement groupByRecipient
    return { all: gifts };
  }, [gifts, groupBy]);

  // Track collapsed sections (start with all expanded)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Filter out empty sections if hideEmptySections is true
  const visibleSections = STATUS_ORDER.filter(status => {
    const sectionGifts = groupedGifts[status] || [];
    return !hideEmptySections || sectionGifts.length > 0;
  });

  // Show empty state if no gifts at all
  if (gifts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <Icon name="card_giftcard" size="2xl" className="text-warm-300 mb-3 mx-auto" />
          <p className="text-warm-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visibleSections.map(status => {
        const sectionGifts = groupedGifts[status] || [];
        const isCollapsed = collapsedSections.has(status);
        const config = STATUS_CONFIG[status] || {
          label: status,
          icon: 'help',
          color: 'text-warm-600',
        };

        return (
          <section key={status} className="space-y-0">
            <Collapsible open={!isCollapsed} onOpenChange={() => toggleSection(status)}>
              {/* Section Header */}
              <div
                className={cn(
                  'flex items-center justify-between p-4',
                  'bg-white/70 dark:bg-warm-900/50',
                  'backdrop-blur-xl',
                  'border border-white/20 dark:border-warm-700/30',
                  'rounded-large',
                  'shadow-subtle',
                  'transition-all duration-200',
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <Icon name={config.icon} size="lg" className={config.color} />

                  {/* Label */}
                  <h2 className="text-lg font-semibold text-warm-900 dark:text-warm-100">
                    {config.label}
                  </h2>

                  {/* Count Badge */}
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full',
                      'bg-warm-200 dark:bg-warm-700',
                      'text-sm font-semibold text-warm-700 dark:text-warm-300',
                    )}
                  >
                    {sectionGifts.length}
                  </span>
                </div>

                {/* Collapse Trigger */}
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'min-h-[44px] min-w-[44px]',
                      'flex items-center justify-center',
                      'rounded-full',
                      'hover:bg-warm-200 dark:hover:bg-warm-700',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    )}
                    aria-label={isCollapsed ? `Expand ${config.label}` : `Collapse ${config.label}`}
                  >
                    <Icon
                      name="expand_more"
                      size="lg"
                      className={cn(
                        'transition-transform duration-200',
                        isCollapsed ? '' : 'rotate-180',
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>

              {/* Section Content */}
              <CollapsibleContent>
                <div
                  className={cn(
                    'grid gap-4 pt-4',
                    'grid-cols-2',
                    'md:grid-cols-3',
                    'lg:grid-cols-4',
                  )}
                >
                  {sectionGifts.map(gift => (
                    <GiftCard key={gift.id} gift={gift} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>
        );
      })}
    </div>
  );
}

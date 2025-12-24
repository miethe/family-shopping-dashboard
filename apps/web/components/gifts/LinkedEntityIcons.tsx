'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { User, CheckSquare } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Minimal person data for recipient icons
 */
export interface LinkedPerson {
  id: number;
  display_name: string;
  photo_url?: string;
}

/**
 * Minimal list data for list icons
 */
export interface LinkedList {
  id: number;
  name: string;
}

/**
 * Props for LinkedEntityIcons component
 */
export interface LinkedEntityIconsProps extends VariantProps<typeof iconVariants> {
  /** Array of linked recipients (people) */
  recipients?: LinkedPerson[];
  /** Array of linked lists */
  lists?: LinkedList[];
  /** Maximum number of icons to show before overflow (default: 3) */
  maxVisible?: number;
  /** Callback when a recipient icon is clicked */
  onRecipientClick?: (personId: number) => void;
  /** Callback when a list icon is clicked */
  onListClick?: (listId: number) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Variants
// ============================================================================

const iconVariants = cva(
  'inline-flex items-center gap-1.5',
  {
    variants: {
      size: {
        sm: 'gap-1',
        md: 'gap-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const iconButtonVariants = cva(
  'relative rounded-full transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
  {
    variants: {
      size: {
        sm: 'min-w-[44px] min-h-[44px] p-2.5', // 44px touch target, 20px visual icon
        md: 'min-w-[44px] min-h-[44px] p-2.5', // 44px touch target, 24px visual icon
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const visualIconSize = {
  sm: 'w-5 h-5', // 20px visual
  md: 'w-6 h-6', // 24px visual
} as const;

// ============================================================================
// Component
// ============================================================================

/**
 * LinkedEntityIcons Component
 *
 * Displays small icons showing linked Recipients (people) and Lists on GiftCard components.
 * Designed to fit in a compact row below the gift title in Grid View.
 *
 * Features:
 * - Recipient icons: Small avatars or User icon with tooltip showing person name
 * - List icons: CheckSquare icon with tooltip showing list name
 * - Icons are clickable to open respective entity modal
 * - Supports maxVisible prop (default 3) with "+N more" overflow indicator
 * - Touch targets are 44x44px minimum (but icons visually 20-24px)
 * - Follows Soft Modernity design system (warm colors, 8px border radius)
 *
 * @example
 * ```tsx
 * <LinkedEntityIcons
 *   recipients={[{ id: 1, display_name: 'John', photo_url: '...' }]}
 *   lists={[{ id: 2, name: 'Christmas 2024' }]}
 *   maxVisible={3}
 *   onRecipientClick={(id) => openPersonModal(id)}
 *   onListClick={(id) => openListModal(id)}
 * />
 * ```
 */
export function LinkedEntityIcons({
  recipients = [],
  lists = [],
  maxVisible = 3,
  onRecipientClick,
  onListClick,
  size = 'md',
  className,
}: LinkedEntityIconsProps) {
  // Calculate totals
  const totalRecipients = recipients.length;
  const totalLists = lists.length;
  const totalEntities = totalRecipients + totalLists;

  // Nothing to render
  if (totalEntities === 0) {
    return null;
  }

  // Determine how many to show
  const visibleRecipients = recipients.slice(0, maxVisible);
  const remainingRecipients = Math.max(0, totalRecipients - maxVisible);

  // Calculate remaining space for lists
  const spaceForLists = maxVisible - visibleRecipients.length;
  const visibleLists = lists.slice(0, spaceForLists);
  const remainingLists = Math.max(0, totalLists - spaceForLists);

  // Total overflow count
  const overflowCount = remainingRecipients + remainingLists;

  // Icon size based on variant
  const iconSize = visualIconSize[size || 'md'];

  return (
    <TooltipProvider>
      <div className={cn(iconVariants({ size }), className)}>
        {/* Recipient Icons */}
        {visibleRecipients.map((person) => (
          <Tooltip key={`recipient-${person.id}`}>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRecipientClick?.(person.id);
                }}
                className={cn(
                  iconButtonVariants({ size }),
                  'hover:scale-110 active:scale-95'
                )}
                aria-label={`View ${person.display_name}`}
                type="button"
              >
                {person.photo_url ? (
                  <Avatar size="xs" className={cn(iconSize, 'border-2 border-white shadow-low')}>
                    <AvatarImage src={person.photo_url} alt={person.display_name} />
                    <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div
                    className={cn(
                      iconSize,
                      'rounded-full bg-warm-100 border-2 border-warm-200 flex items-center justify-center'
                    )}
                  >
                    <User className="w-3 h-3 text-warm-600" />
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Click to filter: {person.display_name}</span>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* List Icons */}
        {visibleLists.map((list) => (
          <Tooltip key={`list-${list.id}`}>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onListClick?.(list.id);
                }}
                className={cn(
                  iconButtonVariants({ size }),
                  'hover:scale-110 active:scale-95'
                )}
                aria-label={`View list: ${list.name}`}
                type="button"
              >
                <div
                  className={cn(
                    iconSize,
                    'rounded-lg bg-primary-100 border-2 border-primary-200 flex items-center justify-center'
                  )}
                >
                  <CheckSquare className="w-3 h-3 text-primary-600" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Click to filter: {list.name}</span>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Overflow Indicator */}
        {overflowCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  iconSize,
                  'rounded-full bg-warm-200 border-2 border-warm-300 flex items-center justify-center text-xs font-semibold text-warm-700'
                )}
                aria-label={`${overflowCount} more ${overflowCount === 1 ? 'item' : 'items'}`}
              >
                +{overflowCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">
                {remainingRecipients > 0 && `${remainingRecipients} more ${remainingRecipients === 1 ? 'recipient' : 'recipients'}`}
                {remainingRecipients > 0 && remainingLists > 0 && ', '}
                {remainingLists > 0 && `${remainingLists} more ${remainingLists === 1 ? 'list' : 'lists'}`}
              </span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

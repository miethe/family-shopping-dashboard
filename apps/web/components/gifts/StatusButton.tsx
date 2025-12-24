/**
 * StatusButton Component
 *
 * Dropdown button for quick gift status changes in the action bar.
 * Features:
 * - Shows current gift status with capitalized label
 * - Dropdown with all 4 status options (idea, selected, purchased, received)
 * - Disabled state during mutation
 * - Toast feedback on success/error
 * - Mobile-first with 44px touch targets
 * - ARIA labels for accessibility
 */

'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown, Check } from '@/components/ui/icons';
import { useUpdateGift } from '@/hooks/useGifts';
import { cn } from '@/lib/utils';
import type { GiftStatus } from '@/types';

// ==================== Types ====================

export interface StatusButtonProps {
  giftId: number;
  currentStatus: GiftStatus;
  onStatusChange?: (status: GiftStatus) => void;
}

// ==================== Constants ====================

const STATUS_OPTIONS: { label: string; value: GiftStatus }[] = [
  { label: 'Idea', value: 'idea' },
  { label: 'Selected', value: 'selected' },
  { label: 'Purchased', value: 'purchased' },
  { label: 'Received', value: 'received' },
];

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== Component ====================

/**
 * StatusButton
 *
 * Compact dropdown button for changing gift status in action bars.
 * Follows existing dropdown patterns from GiftToolbar.
 */
export function StatusButton({
  giftId,
  currentStatus,
  onStatusChange,
}: StatusButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const { mutate: updateGift, isPending } = useUpdateGift(giftId);

  const handleStatusChange = (newStatus: GiftStatus) => {
    // Don't change if selecting current status
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    // Optimistic update
    updateGift(
      { status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status updated',
            description: `Gift status changed to ${capitalize(newStatus)}.`,
          });
          onStatusChange?.(newStatus);
          setIsOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Failed to update status',
            description: error instanceof Error ? error.message : 'An error occurred',
            variant: 'error',
          });
        },
      }
    );
  };

  const currentLabel = capitalize(currentStatus);

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn(
            // Base styles
            'inline-flex items-center gap-2',
            'px-3 py-2',
            'min-h-[44px]',
            'rounded-medium',
            'font-medium text-sm',
            'border-2',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'active:scale-95',

            // Default state
            'bg-warm-100 dark:bg-warm-800',
            'border-warm-300 dark:border-warm-600',
            'text-warm-800 dark:text-warm-200',
            'hover:bg-warm-200 dark:hover:bg-warm-700',
            'hover:border-warm-400 dark:hover:border-warm-500',

            // Disabled state
            isPending && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Change status. Current: ${currentLabel}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <span>{currentLabel}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className={cn(
            'z-50',
            'min-w-[160px]',
            'p-2',
            'bg-white dark:bg-warm-900',
            'backdrop-blur-xl',
            'border border-warm-200 dark:border-warm-700',
            'rounded-large',
            'shadow-diffused',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
          role="menu"
          aria-label="Gift status options"
        >
          {STATUS_OPTIONS.map((option) => {
            const isSelected = option.value === currentStatus;

            return (
              <DropdownMenu.Item
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={isPending}
                className={cn(
                  'flex items-center justify-between gap-3',
                  'px-3 py-2',
                  'min-h-[44px]',
                  'rounded-medium',
                  'font-medium text-sm',
                  'cursor-pointer',
                  'transition-colors duration-200',
                  'focus:outline-none',

                  // Selected state
                  isSelected ? [
                    'bg-primary-100 dark:bg-primary-900/30',
                    'text-primary-800 dark:text-primary-200',
                  ] : [
                    'text-warm-900 dark:text-warm-100',
                    'hover:bg-warm-100 dark:hover:bg-warm-800',
                  ],

                  // Disabled state
                  isPending && 'opacity-50 cursor-not-allowed'
                )}
                role="menuitem"
                aria-label={`Set status to ${option.label}`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check
                    className="w-4 h-4 text-primary-600 dark:text-primary-300"
                    aria-hidden
                  />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

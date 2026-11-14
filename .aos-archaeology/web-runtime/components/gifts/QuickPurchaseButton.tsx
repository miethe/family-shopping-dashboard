'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useUpdateListItemStatus } from '@/hooks/useListItems';
import { listItemApi } from '@/lib/api/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import type { ListItemStatus } from '@/types';

/**
 * ShoppingCart icon - shown when gift is not purchased
 */
const ShoppingCartIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('h-4 w-4', className)}
    {...props}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

/**
 * CheckCircle2 icon - shown when gift is purchased
 */
const CheckCircle2Icon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('h-4 w-4', className)}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/**
 * ChevronDown icon - for dropdown indicator
 */
const ChevronDownIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('h-4 w-4', className)}
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/**
 * Spinner icon - shown during loading state
 */
const SpinnerIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('h-4 w-4 animate-spin', className)}
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export interface ListItemInfo {
  id: number;
  list_id: number;
  list_name: string;
  status: ListItemStatus;
}

export interface QuickPurchaseButtonProps {
  /** Gift ID */
  giftId: number;
  /** List items this gift belongs to (can be multiple lists) */
  listItems: ListItemInfo[];
  /** Optional className for custom styling */
  className?: string;
  /** Callback when purchase is completed (optional) */
  onPurchaseComplete?: () => void;
}

/**
 * QuickPurchaseButton Component
 *
 * Small icon button in the bottom-right of GiftCard to mark a gift as purchased
 * without opening the modal. Follows Soft Modernity design system.
 *
 * **Features**:
 * - Single click marks as purchased (if gift is in one list)
 * - Shows dropdown to select list if gift is in multiple lists
 * - Visual states: default (actionable), purchased (grayed out), loading (spinner)
 * - Optimistic UI updates via React Query
 * - Touch target: 44x44px minimum for mobile accessibility
 *
 * **Design System**:
 * - Colors: Warm sage #7BA676 for actionable, success green when purchased
 * - Border radius: rounded-full for circular button
 * - Shadow: subtle elevation, medium shadow on hover
 * - Touch targets: 44x44px minimum (iOS/mobile compliance)
 *
 * @example
 * ```tsx
 * <QuickPurchaseButton
 *   giftId={123}
 *   listItems={[
 *     { id: 1, list_id: 10, list_name: "Christmas 2024", status: "selected" }
 *   ]}
 *   onPurchaseComplete={() => console.log('Purchased!')}
 * />
 * ```
 */
export function QuickPurchaseButton({
  giftId,
  listItems,
  className,
  onPurchaseComplete,
}: QuickPurchaseButtonProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Check if all list items are purchased
  const allPurchased = listItems.every((item) => item.status === 'purchased');
  const hasSingleList = listItems.length === 1;
  const hasMultipleLists = listItems.length > 1;

  // Get the list_id for single list case
  const singleListId = hasSingleList ? listItems[0].list_id : undefined;

  // Use mutation hook for status update
  const updateStatusMutation = useUpdateListItemStatus(singleListId || 0);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  /**
   * Handle click for single list case
   * Marks the gift as purchased immediately
   */
  const handleSingleListClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (allPurchased || !hasSingleList) return;

    const listItem = listItems[0];
    updateStatusMutation.mutate(
      {
        itemId: listItem.id,
        status: 'purchased',
      },
      {
        onSuccess: () => {
          onPurchaseComplete?.();
        },
      }
    );
  };

  /**
   * Handle click for multiple lists case
   * Opens dropdown to select which list to mark as purchased
   */
  const handleMultipleListsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDropdown(!showDropdown);
  };

  // Query client for manual cache invalidation in multi-list case
  const queryClient = useQueryClient();

  /**
   * Handle selecting a specific list from dropdown
   * Uses API directly since we can't call hooks conditionally
   */
  const handleListSelect = async (listItem: ListItemInfo) => {
    try {
      await listItemApi.updateStatus(listItem.id, 'purchased');
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['list-items', listItem.list_id] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      setShowDropdown(false);
      onPurchaseComplete?.();
    } catch (error) {
      console.error('Failed to mark as purchased:', error);
    }
  };

  // Don't render if no list items
  if (listItems.length === 0) return null;

  // Purchased state (all items purchased)
  if (allPurchased) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'flex items-center justify-center rounded-full',
                'bg-status-success-100 border-2 border-status-success-300',
                'min-h-[44px] min-w-[44px] w-11 h-11',
                'cursor-not-allowed opacity-60',
                'transition-all duration-200 ease-out',
                className
              )}
              disabled
              aria-label="Purchased"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle2Icon className="w-5 h-5 text-status-success-700" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Purchased</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Loading state
  if (updateStatusMutation.isPending) {
    return (
      <button
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-warm-100 border-2 border-warm-300',
          'min-h-[44px] min-w-[44px] w-11 h-11',
          'cursor-wait',
          'transition-all duration-200 ease-out',
          className
        )}
        disabled
        aria-label="Marking as purchased..."
        onClick={(e) => e.stopPropagation()}
      >
        <SpinnerIcon className="w-5 h-5 text-warm-600" />
      </button>
    );
  }

  // Single list case
  if (hasSingleList) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSingleListClick}
              className={cn(
                'flex items-center justify-center rounded-full',
                'bg-white border-2 border-status-success-400',
                'min-h-[44px] min-w-[44px] w-11 h-11',
                'hover:bg-status-success-50 hover:border-status-success-500',
                'hover:shadow-medium active:scale-95',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-status-success-500 focus:ring-offset-2',
                className
              )}
              aria-label="Mark as purchased"
            >
              <ShoppingCartIcon className="w-5 h-5 text-status-success-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Mark as purchased</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Multiple lists case - show dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleMultipleListsClick}
              className={cn(
                'flex items-center justify-center gap-1 rounded-full',
                'bg-white border-2 border-status-success-400',
                'min-h-[44px] min-w-[44px] h-11 px-3',
                'hover:bg-status-success-50 hover:border-status-success-500',
                'hover:shadow-medium active:scale-95',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-status-success-500 focus:ring-offset-2',
                className
              )}
              aria-label="Mark as purchased (select list)"
              aria-expanded={showDropdown}
            >
              <ShoppingCartIcon className="w-4 h-4 text-status-success-600" />
              <ChevronDownIcon className="w-3 h-3 text-status-success-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Select list to mark as purchased</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className={cn(
            'absolute bottom-full right-0 mb-2 z-50',
            'min-w-[200px] bg-white rounded-large border border-warm-200',
            'shadow-medium overflow-hidden',
            'animate-in fade-in-0 slide-in-from-bottom-2 duration-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-warm-600 border-b border-warm-200">
              Mark as purchased in:
            </div>
            {listItems
              .filter((item) => item.status !== 'purchased')
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleListSelect(item)}
                  className={cn(
                    'w-full px-3 py-3 text-left text-sm text-warm-900',
                    'hover:bg-warm-100 transition-colors',
                    'flex items-center gap-2 min-h-[44px]'
                  )}
                >
                  <ShoppingCartIcon className="w-4 h-4 text-status-success-600 flex-shrink-0" />
                  <span className="truncate">{item.list_name}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

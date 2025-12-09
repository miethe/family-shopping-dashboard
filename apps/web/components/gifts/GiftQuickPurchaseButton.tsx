'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { GiftStatus } from '@/types';

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
 * CheckCircle icon - shown briefly after successful purchase
 */
const CheckCircleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
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

export interface GiftQuickPurchaseButtonProps {
  /** Gift ID */
  giftId: number;
  /** Current gift status */
  currentStatus: GiftStatus | undefined;
  /** Callback when purchase button is clicked - should update Gift.status to 'purchased' */
  onPurchase: () => void;
  /** Whether the mutation is pending */
  isPending: boolean;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * GiftQuickPurchaseButton Component
 *
 * Quick purchase button for gifts that directly updates Gift.status.
 * Shows for ALL gifts with status !== 'purchased', regardless of list association.
 *
 * **Features**:
 * - Single click marks gift as purchased
 * - Shows success checkmark briefly after purchase, then disappears
 * - Optimistic UI updates via React Query
 * - Touch target: 44x44px minimum for mobile accessibility
 *
 * **Design System**:
 * - Colors: Success green for actionable state
 * - Border radius: rounded-full for circular button
 * - Shadow: subtle elevation, medium shadow on hover
 * - Touch targets: 44x44px minimum (iOS/mobile compliance)
 *
 * @example
 * ```tsx
 * <GiftQuickPurchaseButton
 *   giftId={123}
 *   currentStatus={gift.status}
 *   onPurchase={() => handleStatusChange('purchased')}
 *   isPending={updateGiftMutation.isPending}
 * />
 * ```
 */
export function GiftQuickPurchaseButton({
  giftId,
  currentStatus,
  onPurchase,
  isPending,
  className,
}: GiftQuickPurchaseButtonProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [wasClicked, setWasClicked] = React.useState(false);

  // Handle success animation
  React.useEffect(() => {
    if (wasClicked && !isPending && currentStatus === 'purchased') {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [wasClicked, isPending, currentStatus]);

  // Don't render if already purchased (and not showing success)
  if (currentStatus === 'purchased' && !showSuccess) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWasClicked(true);
    onPurchase();
  };

  // Success state
  if (showSuccess) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-status-success-100 border-2 border-status-success-400',
          'min-h-[44px] min-w-[44px] w-11 h-11',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        aria-label="Purchased successfully"
      >
        <CheckCircleIcon className="w-5 h-5 text-status-success-600" />
      </div>
    );
  }

  // Loading state
  if (isPending) {
    return (
      <button
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-warm-100 border-2 border-warm-300',
          'min-h-[44px] min-w-[44px] w-11 h-11',
          'cursor-wait',
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

  // Default actionable state
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
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

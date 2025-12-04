'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Gift {
  id: number;
  name: string;
  price: number | null;
  recipient?: string;
}

interface BudgetTooltipProps {
  segment: 'purchased' | 'planned';
  gifts: Gift[];
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  className?: string;
}

/**
 * BudgetTooltip Component
 *
 * Displays gift details when hovering/clicking budget segments.
 * - Desktop: Floating popover near segment
 * - Mobile: Bottom sheet style
 *
 * Features:
 * - Glass morphism background
 * - Scrollable gift list (max 5 visible)
 * - Keyboard navigation (ESC to close)
 * - Focus trap for accessibility
 */
export function BudgetTooltip({
  segment,
  gifts,
  totalAmount,
  isOpen,
  onClose,
  anchorEl,
  className,
}: BudgetTooltipProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !anchorEl?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  // Focus trap
  React.useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const segmentTitle = segment === 'purchased' ? 'Purchased' : 'Planned';
  const hasGifts = gifts.length > 0;

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${amount.toFixed(2)}`;
  };

  return (
    <>
      {/* Backdrop - visible on mobile */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-40',
          'md:hidden', // Only show on mobile
          'animate-in fade-in-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tooltip Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-label="Budget details"
        aria-modal="true"
        className={cn(
          // Base styles
          'z-50 overflow-hidden',
          'bg-white/95 backdrop-blur-sm',
          'border border-gray-200 shadow-lg',

          // Mobile: Bottom sheet
          'fixed bottom-0 left-0 right-0',
          'rounded-t-lg',
          'max-h-[50vh]',
          'animate-in slide-in-from-bottom-full',

          // Desktop: Floating popover
          'md:fixed md:bottom-auto md:left-auto md:right-auto',
          'md:rounded-lg',
          'md:max-h-[300px] md:w-[320px]',
          'md:animate-in md:fade-in-0 md:zoom-in-95',

          className
        )}
        style={
          anchorEl && window.innerWidth >= 768
            ? {
                top: `${anchorEl.getBoundingClientRect().bottom + 8}px`,
                left: `${anchorEl.getBoundingClientRect().left}px`,
              }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {segmentTitle} ({formatCurrency(totalAmount)})
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close tooltip"
            className="h-8 w-8 -mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        {/* Gift List */}
        <div
          className={cn(
            'overflow-y-auto',
            'max-h-[calc(50vh-80px)]', // Mobile: Account for header
            'md:max-h-[236px]' // Desktop: 300px total - 64px header
          )}
        >
          {hasGifts ? (
            <ul className="divide-y divide-gray-100">
              {gifts.map((gift) => (
                <li
                  key={gift.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {gift.name}
                      </p>
                      {gift.recipient && (
                        <p className="text-xs text-gray-500 mt-1">
                          For: {gift.recipient}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(gift.price)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">
                No gifts in this category
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

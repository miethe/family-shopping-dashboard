'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from '@/components/ui/icons';

// All gift status values matching backend schema
type GiftStatus = 'idea' | 'selected' | 'purchased' | 'received';

interface StatusSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  status: GiftStatus;
  onChange: (status: GiftStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional accessible label
   */
  ariaLabel?: string;
}

const statusConfig: Record<GiftStatus, { bg: string; text: string; border: string; dot: string; label: string }> = {
  idea: {
    bg: 'bg-status-idea-100',
    text: 'text-status-idea-900',
    border: 'border-status-idea-300',
    dot: 'bg-status-idea-600',
    label: 'Idea',
  },
  selected: {
    bg: 'bg-status-progress-100',
    text: 'text-status-progress-900',
    border: 'border-status-progress-300',
    dot: 'bg-status-progress-600',
    label: 'Selected',
  },
  purchased: {
    bg: 'bg-status-success-100',
    text: 'text-status-success-900',
    border: 'border-status-success-300',
    dot: 'bg-status-success-600',
    label: 'Purchased',
  },
  received: {
    bg: 'bg-status-success-100',
    text: 'text-status-success-900',
    border: 'border-status-success-300',
    dot: 'bg-status-success-600',
    label: 'Received',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm',
};

const dotSizeClasses = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

const iconSizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
};

/**
 * StatusSelector Component
 *
 * Interactive dropdown for changing gift status.
 * Shows current status as a pill with dropdown icon,
 * and displays all available statuses when clicked.
 *
 * Features:
 * - Dropdown menu with all status options
 * - Matches StatusPill design (Soft Modernity)
 * - Prevents event propagation to parent
 * - Accessible keyboard navigation
 * - Mobile-friendly 44px touch targets
 */
export function StatusSelector({
  status,
  onChange,
  disabled = false,
  size = 'md',
  ariaLabel,
  className,
  ...props
}: StatusSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const config = statusConfig[status];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (newStatus: GiftStatus) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(newStatus);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block', className)}
      {...props}
    >
      {/* Current Status Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 font-semibold rounded-small border',
          'transition-all duration-300 ease-out',
          'min-h-[44px] cursor-pointer',
          'hover:shadow-md hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
          sizeClasses[size],
          config.bg,
          config.text,
          config.border
        )}
        aria-label={ariaLabel || `Change status from ${config.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            'rounded-full transition-colors duration-300',
            dotSizeClasses[size],
            config.dot
          )}
          aria-hidden="true"
        />
        {config.label}
        <ChevronDown
          className={cn(
            'transition-transform duration-200',
            iconSizeClasses[size],
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2',
            'bg-white dark:bg-warm-800',
            'border border-warm-200 dark:border-warm-700',
            'rounded-large shadow-diffused',
            'py-2 min-w-[160px]',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
            'max-h-[300px] overflow-y-auto'
          )}
          role="listbox"
          aria-label="Select status"
        >
          {(Object.keys(statusConfig) as GiftStatus[]).map((statusOption) => {
            const optionConfig = statusConfig[statusOption];
            const isSelected = statusOption === status;

            return (
              <button
                key={statusOption}
                type="button"
                onClick={handleSelect(statusOption)}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'w-full text-left px-3 py-2',
                  'flex items-center gap-2',
                  'transition-colors duration-200',
                  'hover:bg-warm-100 dark:hover:bg-warm-700',
                  'focus:outline-none focus:bg-warm-100 dark:focus:bg-warm-700',
                  isSelected && 'bg-warm-50 dark:bg-warm-750'
                )}
              >
                <span
                  className={cn(
                    'rounded-full flex-shrink-0',
                    dotSizeClasses[size],
                    optionConfig.dot
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'font-semibold text-xs',
                    optionConfig.text
                  )}
                >
                  {optionConfig.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export type { GiftStatus, StatusSelectorProps };

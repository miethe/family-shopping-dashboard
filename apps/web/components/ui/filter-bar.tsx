'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon, IconNames } from './icon';
import { Badge } from './badge';

// ==================== FilterChip ====================

export interface FilterChipProps {
  /** Filter label */
  label: string;
  /** Selected state */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterChip - Individual filter option with multi-select support
 * - 44px minimum touch target
 * - Visual feedback for selected state
 * - Smooth transitions
 * - Keyboard accessible
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ label, selected = false, onClick, disabled = false, className }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center gap-2 px-4 py-2',
          'min-h-[44px] min-w-[44px]',
          'rounded-full',
          'font-body text-body-medium font-semibold',
          'border-2',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2',
          'active:scale-95',

          // Unselected state
          !selected && [
            'bg-warm-100 dark:bg-warm-800',
            'border-warm-300 dark:border-warm-600',
            'text-warm-800 dark:text-warm-200',
            'hover:bg-warm-200 dark:hover:bg-warm-700',
            'hover:border-warm-400 dark:hover:border-warm-500',
          ],

          // Selected state
          selected && [
            'bg-primary-100 dark:bg-primary-900/30',
            'border-primary-500 dark:border-primary-400',
            'text-primary-800 dark:text-primary-200',
            'hover:bg-primary-200 dark:hover:bg-primary-800/40',
            'hover:border-primary-600 dark:hover:border-primary-300',
          ],

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',

          className
        )}
        aria-pressed={selected}
      >
        {/* Checkmark icon for selected state */}
        {selected && (
          <Icon
            name={IconNames.check}
            size="sm"
            className="text-primary-600 dark:text-primary-300"
            aria-hidden
          />
        )}
        {label}
      </button>
    );
  }
);
FilterChip.displayName = 'FilterChip';

// ==================== FilterDropdown ====================

export interface FilterDropdownOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  /** Dropdown options */
  options: FilterDropdownOption[];
  /** Selected value */
  selected?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterDropdown - Dropdown-style filter
 * - Native select for better mobile UX
 * - Consistent styling with FilterChip
 */
export const FilterDropdown = React.forwardRef<HTMLSelectElement, FilterDropdownProps>(
  ({ options, selected, onChange, placeholder = 'Select...', className }, ref) => {
    return (
      <div className="relative inline-flex">
        <select
          ref={ref}
          value={selected || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            // Base styles
            'appearance-none',
            'px-4 py-2 pr-10',
            'min-h-[44px]',
            'rounded-full',
            'font-body text-body-medium font-semibold',
            'border-2',
            'bg-warm-100 dark:bg-warm-800',
            'border-warm-300 dark:border-warm-600',
            'text-warm-800 dark:text-warm-200',
            'transition-all duration-200',
            'hover:bg-warm-200 dark:hover:bg-warm-700',
            'hover:border-warm-400 dark:hover:border-warm-500',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2',
            'cursor-pointer',
            className
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <Icon
          name={IconNames.chevronDown}
          size="sm"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-600 dark:text-warm-400 pointer-events-none"
          aria-hidden
        />
      </div>
    );
  }
);
FilterDropdown.displayName = 'FilterDropdown';

// ==================== FilterGroup ====================

export interface FilterGroupProps {
  /** Group label */
  label: string;
  /** Group content (FilterChips or FilterDropdowns) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterGroup - Groups related filters with a label
 */
export function FilterGroup({ label, children, className }: FilterGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-label-small text-warm-600 dark:text-warm-400 uppercase tracking-wide px-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

// ==================== FilterBar ====================

export interface FilterBarProps {
  /** Active filter count */
  activeCount?: number;
  /** Clear all handler */
  onClearAll?: () => void;
  /** Filter groups and chips */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Show clear all button */
  showClearAll?: boolean;
}

/**
 * FilterBar - Container for filters with clear all functionality
 * - Active filter count badge
 * - Clear all button
 * - Flexible layout for filter groups
 * - Mobile responsive
 *
 * Usage:
 * ```tsx
 * <FilterBar activeCount={3} onClearAll={() => resetFilters()}>
 *   <FilterGroup label="Status">
 *     <FilterChip
 *       label="Ideas"
 *       selected={filters.includes('idea')}
 *       onClick={() => toggleFilter('idea')}
 *     />
 *     <FilterChip
 *       label="To Buy"
 *       selected={filters.includes('to-buy')}
 *       onClick={() => toggleFilter('to-buy')}
 *     />
 *   </FilterGroup>
 * </FilterBar>
 * ```
 */
export function FilterBar({
  activeCount = 0,
  onClearAll,
  children,
  className,
  showClearAll = true,
}: FilterBarProps) {
  const hasActiveFilters = activeCount > 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4',
        'bg-white/70 dark:bg-warm-900/50',
        'backdrop-blur-xl',
        'border border-white/20 dark:border-warm-700/30',
        'rounded-large',
        'shadow-subtle',
        className
      )}
      role="group"
      aria-label="Filters"
    >
      {/* Header with count and clear all */}
      {(hasActiveFilters || showClearAll) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-label-small text-warm-600 dark:text-warm-400 uppercase tracking-wide">
              Filters
            </span>
            {hasActiveFilters && (
              <Badge variant="primary" size="sm">
                {activeCount}
              </Badge>
            )}
          </div>

          {showClearAll && hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className={cn(
                'text-body-small font-semibold',
                'text-primary-600 dark:text-primary-400',
                'hover:text-primary-700 dark:hover:text-primary-300',
                'hover:underline',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2',
                'rounded-small px-2 py-1',
                'min-h-[32px]'
              )}
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Filter content */}
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

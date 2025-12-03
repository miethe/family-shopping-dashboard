'use client';

import { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Input } from '@/components/ui/input';
import { Icon, IconNames } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { FilterChip } from '@/components/ui/filter-bar';
import { usePersons } from '@/hooks/usePersons';
import { useLists } from '@/hooks/useLists';
import { useOccasions } from '@/hooks/useOccasions';
import { cn } from '@/lib/utils';

// ==================== Types ====================

export type SortOption = 'recent' | 'price_asc' | 'price_desc';
export type GroupOption = 'none' | 'status' | 'recipient';

export interface GiftFilterValues {
  person_ids: number[];
  statuses: string[];
  list_ids: number[];
  occasion_ids: number[];
}

export interface GiftToolbarProps {
  // Search
  search: string;
  onSearchChange: (search: string) => void;

  // Filters
  filters: GiftFilterValues;
  onFiltersChange: (filters: GiftFilterValues) => void;

  // Sort
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;

  // Grouping (new feature)
  groupBy: GroupOption;
  onGroupByChange: (groupBy: GroupOption) => void;

  // Active filter count
  activeFilterCount?: number;
}

// ==================== Constants ====================

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Ideas' },
  { value: 'selected', label: 'Selected' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'received', label: 'Received' },
];

const SORT_OPTIONS: { value: SortOption; label: string; icon?: string }[] = [
  { value: 'recent', label: 'Most Recent', icon: IconNames.calendar },
  { value: 'price_asc', label: 'Price: Low to High', icon: IconNames.arrowUp },
  { value: 'price_desc', label: 'Price: High to Low', icon: IconNames.arrowDown },
];

const GROUP_OPTIONS: { value: GroupOption; label: string; icon: string }[] = [
  { value: 'none', label: 'Grid View', icon: IconNames.kanban },
  { value: 'status', label: 'Group by Status', icon: IconNames.table },
  { value: 'recipient', label: 'Group by Recipient', icon: IconNames.people },
];

// ==================== Filter Dropdown Component ====================

interface FilterDropdownProps {
  label: string;
  icon?: string;
  selectedCount: number;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function FilterDropdown({
  label,
  icon,
  selectedCount,
  children,
  open,
  onOpenChange
}: FilterDropdownProps) {
  const displayLabel = selectedCount > 0
    ? `${label} (${selectedCount})`
    : label;

  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            // Base styles
            'inline-flex items-center gap-2',
            'px-3 py-2',
            'min-h-[44px]',
            'rounded-full',
            'font-body text-body-small font-semibold',
            'border-2',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2',
            'active:scale-95',
            'whitespace-nowrap',

            // State-based colors
            selectedCount > 0 ? [
              // Active state - highlighted
              'bg-primary-100 dark:bg-primary-900/30',
              'border-primary-500 dark:border-primary-400',
              'text-primary-800 dark:text-primary-200',
              'hover:bg-primary-200 dark:hover:bg-primary-800/40',
              'hover:border-primary-600 dark:hover:border-primary-300',
            ] : [
              // Default state
              'bg-warm-100 dark:bg-warm-800',
              'border-warm-300 dark:border-warm-600',
              'text-warm-800 dark:text-warm-200',
              'hover:bg-warm-200 dark:hover:bg-warm-700',
              'hover:border-warm-400 dark:hover:border-warm-500',
            ]
          )}
          aria-label={`Filter by ${label}`}
        >
          {icon && (
            <Icon
              name={icon}
              size="sm"
              aria-hidden
            />
          )}
          <span>{displayLabel}</span>
          <Icon
            name={IconNames.chevronDown}
            size="xs"
            aria-hidden
            className="transition-transform duration-200"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className={cn(
            'z-50',
            'min-w-[200px] max-w-[300px]',
            'p-3',
            'bg-white/95 dark:bg-warm-900/95',
            'backdrop-blur-xl',
            'border border-white/20 dark:border-warm-700/30',
            'rounded-large',
            'shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
        >
          <div className="flex flex-col gap-2">
            {children}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ==================== Main Component ====================

/**
 * GiftToolbar Component
 *
 * Unified toolbar for gift filtering, searching, sorting, and grouping.
 * - Inline compact design with glassmorphism styling
 * - Mobile-first responsive (search on top, filters wrap)
 * - Multi-select filter dropdowns for Status, Recipient, List
 * - Sort dropdown with visual indicators
 * - Group toggle for grid/status/recipient grouping
 * - Clear filters button when filters active
 */
export function GiftToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  groupBy,
  onGroupByChange,
  activeFilterCount: providedActiveCount,
}: GiftToolbarProps) {
  // Load filter options
  // Disable real-time sync for toolbar data to prevent WebSocket subscription storm
  // These rarely change during a session and can be refetched manually if needed
  const { data: personsData, isLoading: personsLoading } = usePersons(undefined, { disableRealtime: true });
  const { data: listsData, isLoading: listsLoading } = useLists(undefined, { disableRealtime: true });
  const { data: occasionsData, isLoading: occasionsLoading } = useOccasions(undefined, { disableRealtime: true });

  // Calculate active filter count
  const activeCount = providedActiveCount ?? (
    filters.person_ids.length +
    filters.statuses.length +
    filters.list_ids.length +
    filters.occasion_ids.length
  );

  // ==================== Filter Handlers ====================

  const toggleStatusFilter = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const togglePersonFilter = (personId: number) => {
    const newPersonIds = filters.person_ids.includes(personId)
      ? filters.person_ids.filter((id) => id !== personId)
      : [...filters.person_ids, personId];
    onFiltersChange({ ...filters, person_ids: newPersonIds });
  };

  const toggleListFilter = (listId: number) => {
    const newListIds = filters.list_ids.includes(listId)
      ? filters.list_ids.filter((id) => id !== listId)
      : [...filters.list_ids, listId];
    onFiltersChange({ ...filters, list_ids: newListIds });
  };

  const toggleOccasionFilter = (occasionId: number) => {
    const newOccasionIds = filters.occasion_ids.includes(occasionId)
      ? filters.occasion_ids.filter((id) => id !== occasionId)
      : [...filters.occasion_ids, occasionId];
    onFiltersChange({ ...filters, occasion_ids: newOccasionIds });
  };

  const handleClearAll = () => {
    onFiltersChange({
      person_ids: [],
      statuses: [],
      list_ids: [],
      occasion_ids: [],
    });
  };

  // ==================== Render ====================

  return (
    <div
      className={cn(
        // Glassmorphism container
        'flex flex-col md:flex-row items-stretch md:items-center gap-3',
        'p-3 md:p-4',
        'bg-white/70 dark:bg-warm-900/50',
        'backdrop-blur-xl',
        'border border-white/20 dark:border-warm-700/30',
        'rounded-large',
        'shadow-subtle'
      )}
      role="search"
      aria-label="Gift search and filters"
    >
      {/* Search Input - Full width on mobile, constrained on desktop */}
      <div className="w-full md:max-w-[240px] relative">
        <Icon
          name={IconNames.search}
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-600 dark:text-warm-400 pointer-events-none"
          aria-hidden
        />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full',
            'pl-10 pr-4 py-2',
            'min-h-[44px]',
            'rounded-full',
            'border-2 border-warm-300 dark:border-warm-600',
            'bg-white dark:bg-warm-800',
            'text-warm-900 dark:text-warm-100',
            'placeholder:text-warm-400',
            'font-body text-body-small',
            'transition-all duration-200',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            'hover:border-warm-400 dark:hover:border-warm-500'
          )}
          aria-label="Search gifts"
        />
      </div>

      {/* Filter Dropdowns - Wrap on mobile */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1">
        {/* Status Filter */}
        <FilterDropdown
          label="Status"
          selectedCount={filters.statuses.length}
        >
          {STATUS_OPTIONS.map((status) => (
            <FilterChip
              key={status.value}
              label={status.label}
              selected={filters.statuses.includes(status.value)}
              onClick={() => toggleStatusFilter(status.value)}
              className="w-full justify-start"
            />
          ))}
        </FilterDropdown>

        {/* Recipient Filter */}
        {!personsLoading && personsData?.items && personsData.items.length > 0 && (
          <FilterDropdown
            label="Recipient"
            selectedCount={filters.person_ids.length}
          >
            {personsData.items.map((person) => (
              <FilterChip
                key={person.id}
                label={person.display_name}
                selected={filters.person_ids.includes(person.id)}
                onClick={() => togglePersonFilter(person.id)}
                className="w-full justify-start"
              />
            ))}
          </FilterDropdown>
        )}

        {/* List Filter */}
        {!listsLoading && listsData?.items && listsData.items.length > 0 && (
          <FilterDropdown
            label="List"
            selectedCount={filters.list_ids.length}
          >
            {listsData.items.map((list) => (
              <FilterChip
                key={list.id}
                label={list.name}
                selected={filters.list_ids.includes(list.id)}
                onClick={() => toggleListFilter(list.id)}
                className="w-full justify-start"
              />
            ))}
          </FilterDropdown>
        )}

        {/* Occasion Filter (if available) */}
        {!occasionsLoading && occasionsData?.items && occasionsData.items.length > 0 && (
          <FilterDropdown
            label="Occasion"
            selectedCount={filters.occasion_ids.length}
          >
            {occasionsData.items.map((occasion) => (
              <FilterChip
                key={occasion.id}
                label={occasion.name}
                selected={filters.occasion_ids.includes(occasion.id)}
                onClick={() => toggleOccasionFilter(occasion.id)}
                className="w-full justify-start"
              />
            ))}
          </FilterDropdown>
        )}

        {/* Sort Dropdown */}
        <FilterDropdown
          label={SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
          selectedCount={0} // Sort is always selected but not counted as a filter
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'min-h-[44px]',
                'w-full',
                'rounded-medium',
                'text-left',
                'font-body text-body-small font-medium',
                'transition-all duration-200',
                sort === option.value ? [
                  'bg-primary-100 dark:bg-primary-900/30',
                  'text-primary-800 dark:text-primary-200',
                ] : [
                  'text-warm-800 dark:text-warm-200',
                  'hover:bg-warm-100 dark:hover:bg-warm-800',
                ]
              )}
            >
              {option.icon && (
                <Icon
                  name={option.icon}
                  size="sm"
                  aria-hidden
                />
              )}
              <span>{option.label}</span>
              {sort === option.value && (
                <Icon
                  name={IconNames.check}
                  size="sm"
                  className="ml-auto text-primary-600 dark:text-primary-300"
                  aria-hidden
                />
              )}
            </button>
          ))}
        </FilterDropdown>

        {/* Group Toggle */}
        <FilterDropdown
          label={GROUP_OPTIONS.find(o => o.value === groupBy)?.label || 'Group'}
          selectedCount={groupBy !== 'none' ? 1 : 0}
        >
          {GROUP_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onGroupByChange(option.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'min-h-[44px]',
                'w-full',
                'rounded-medium',
                'text-left',
                'font-body text-body-small font-medium',
                'transition-all duration-200',
                groupBy === option.value ? [
                  'bg-primary-100 dark:bg-primary-900/30',
                  'text-primary-800 dark:text-primary-200',
                ] : [
                  'text-warm-800 dark:text-warm-200',
                  'hover:bg-warm-100 dark:hover:bg-warm-800',
                ]
              )}
            >
              <Icon
                name={option.icon}
                size="sm"
                aria-hidden
              />
              <span>{option.label}</span>
              {groupBy === option.value && (
                <Icon
                  name={IconNames.check}
                  size="sm"
                  className="ml-auto text-primary-600 dark:text-primary-300"
                  aria-hidden
                />
              )}
            </button>
          ))}
        </FilterDropdown>

        {/* Clear Filters Button */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className={cn(
              'inline-flex items-center gap-2',
              'px-3 py-2',
              'min-h-[44px]',
              'rounded-full',
              'text-body-small font-semibold',
              'text-primary-600 dark:text-primary-400',
              'hover:text-primary-700 dark:hover:text-primary-300',
              'hover:underline',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2'
            )}
            aria-label={`Clear ${activeCount} active filters`}
          >
            <Icon name={IconNames.close} size="sm" aria-hidden />
            <span>Clear ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}

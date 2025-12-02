'use client';

import { FilterBar, FilterGroup, FilterChip } from '@/components/ui/filter-bar';
import { usePersons } from '@/hooks/usePersons';
import { useLists } from '@/hooks/useLists';
import { useOccasions } from '@/hooks/useOccasions';

export interface GiftFilterValues {
  person_ids: number[];
  statuses: string[];
  list_ids: number[];
  occasion_ids: number[];
}

export interface GiftFiltersProps {
  filters: GiftFilterValues;
  onFiltersChange: (filters: GiftFilterValues) => void;
}

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Ideas' },
  { value: 'selected', label: 'Selected' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'received', label: 'Received' },
];

/**
 * GiftFilters Component
 *
 * Multi-select filter bar for gifts with recipient, status, list, and occasion filters.
 * - Uses existing FilterBar, FilterGroup, and FilterChip components
 * - Loads filter options dynamically from API
 * - Mobile-responsive with 44px touch targets
 * - Shows active filter count with clear all functionality
 */
export function GiftFilters({ filters, onFiltersChange }: GiftFiltersProps) {
  const { data: personsData, isLoading: personsLoading } = usePersons();
  const { data: listsData, isLoading: listsLoading } = useLists();
  const { data: occasionsData, isLoading: occasionsLoading } = useOccasions();

  // Calculate active filter count
  const activeCount =
    filters.person_ids.length +
    filters.statuses.length +
    filters.list_ids.length +
    filters.occasion_ids.length;

  // Toggle filter selection
  const togglePersonFilter = (personId: number) => {
    const newPersonIds = filters.person_ids.includes(personId)
      ? filters.person_ids.filter((id) => id !== personId)
      : [...filters.person_ids, personId];
    onFiltersChange({ ...filters, person_ids: newPersonIds });
  };

  const toggleStatusFilter = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
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

  // Clear all filters
  const handleClearAll = () => {
    onFiltersChange({
      person_ids: [],
      statuses: [],
      list_ids: [],
      occasion_ids: [],
    });
  };

  return (
    <FilterBar activeCount={activeCount} onClearAll={handleClearAll}>
      {/* Status Filter */}
      <FilterGroup label="Status">
        {STATUS_OPTIONS.map((status) => (
          <FilterChip
            key={status.value}
            label={status.label}
            selected={filters.statuses.includes(status.value)}
            onClick={() => toggleStatusFilter(status.value)}
          />
        ))}
      </FilterGroup>

      {/* Recipient Filter */}
      {!personsLoading && personsData?.items && personsData.items.length > 0 && (
        <FilterGroup label="Recipient">
          {personsData.items.map((person) => (
            <FilterChip
              key={person.id}
              label={person.display_name}
              selected={filters.person_ids.includes(person.id)}
              onClick={() => togglePersonFilter(person.id)}
            />
          ))}
        </FilterGroup>
      )}

      {/* List Filter */}
      {!listsLoading && listsData?.items && listsData.items.length > 0 && (
        <FilterGroup label="List">
          {listsData.items.map((list) => (
            <FilterChip
              key={list.id}
              label={list.name}
              selected={filters.list_ids.includes(list.id)}
              onClick={() => toggleListFilter(list.id)}
            />
          ))}
        </FilterGroup>
      )}

      {/* Occasion Filter */}
      {!occasionsLoading && occasionsData?.items && occasionsData.items.length > 0 && (
        <FilterGroup label="Occasion">
          {occasionsData.items.map((occasion) => (
            <FilterChip
              key={occasion.id}
              label={occasion.name}
              selected={filters.occasion_ids.includes(occasion.id)}
              onClick={() => toggleOccasionFilter(occasion.id)}
            />
          ))}
        </FilterGroup>
      )}
    </FilterBar>
  );
}

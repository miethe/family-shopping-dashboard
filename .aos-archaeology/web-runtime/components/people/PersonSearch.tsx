'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

export interface PersonSearchProps {
  onSearch?: (query: string) => void;
  onFilterRelationship?: (relationship: string) => void;
}

/**
 * Person Search Component
 *
 * Search and filter bar for people list:
 * - Search input with 44px touch target
 * - Optional relationship filter (for future enhancement)
 * - Client-side filtering for V1
 */
export function PersonSearch({ onSearch, onFilterRelationship }: PersonSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      {/* Search Input */}
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search people..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full"
          aria-label="Search people by name or interests"
        />
      </div>

      {/* Future: Relationship filter dropdown */}
      {/* This can be expanded in future iterations */}
    </div>
  );
}

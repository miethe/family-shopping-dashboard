'use client';

import { Input } from '@/components/ui';

export type SortOption = 'recent' | 'price_asc' | 'price_desc';

export interface GiftSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

/**
 * Gift Search Component
 *
 * Search bar with sort dropdown for filtering gifts.
 * Mobile-first responsive design with proper touch targets.
 */
export function GiftSearch({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: GiftSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search gifts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Sort Dropdown */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="
          border border-gray-300 rounded-md
          px-3 py-2
          min-h-[44px]
          bg-white
          text-gray-900
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          cursor-pointer
        "
      >
        <option value="recent">Most Recent</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}

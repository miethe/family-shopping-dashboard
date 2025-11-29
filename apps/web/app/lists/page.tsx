/**
 * Lists Page
 *
 * Redesigned all lists view with inspiration design.
 * Features glassmorphism sections grouped by occasion, action buttons,
 * and modern card grid layout. Mobile-first responsive.
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLists } from '@/hooks/useLists';
import { useOccasions } from '@/hooks/useOccasions';
import { Skeleton } from '@/components/ui/skeleton';
import { ListCard } from '@/components/lists';
import { FilterIcon, ArrowUpDownIcon, PlusIcon } from '@/components/layout/icons';
import type { ListType, GiftList } from '@/types';

type ListTypeFilter = 'all' | ListType;

export default function ListsPage() {
  const [typeFilter, setTypeFilter] = useState<ListTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Convert filter for API
  const apiFilter = typeFilter === 'all' ? undefined : typeFilter;

  // Fetch lists with type filter
  const { data: listsData, isLoading: listsLoading, error } = useLists({ type: apiFilter });

  // Fetch occasions for grouping
  const { data: occasionsData, isLoading: occasionsLoading } = useOccasions();

  // Group lists by occasion
  const groupedLists = useMemo(() => {
    if (!listsData?.items) return { withOccasion: {}, withoutOccasion: [] };

    const withOccasion: Record<number, { occasion: any; lists: GiftList[] }> = {};
    const withoutOccasion: GiftList[] = [];

    listsData.items.forEach((list) => {
      if (list.occasion_id) {
        if (!withOccasion[list.occasion_id]) {
          const occasion = occasionsData?.items?.find((o) => o.id === list.occasion_id);
          withOccasion[list.occasion_id] = {
            occasion: occasion || { id: list.occasion_id, name: 'Unknown Occasion' },
            lists: [],
          };
        }
        withOccasion[list.occasion_id].lists.push(list);
      } else {
        withoutOccasion.push(list);
      }
    });

    return { withOccasion, withoutOccasion };
  }, [listsData, occasionsData]);

  const isLoading = listsLoading || occasionsLoading;

  // Calculate totals for header subtitle
  const totalLists = listsData?.items.length || 0;
  const activeOccasions = Object.keys(groupedLists.withOccasion).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-20">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-charcoal mb-2">All Lists</h1>
          <p className="text-gray-500 font-medium">
            {totalLists} lists · {activeOccasions} active occasions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              // TODO: Implement filter functionality
              console.log('Filter clicked');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100 min-h-[44px]"
          >
            <FilterIcon className="w-[18px] h-[18px]" /> Filter
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100 min-h-[44px]"
          >
            <ArrowUpDownIcon className="w-[18px] h-[18px]" /> Sort
          </button>
          <Link href="/lists/new">
            <button className="flex items-center gap-2 px-5 py-2 bg-salmon text-white rounded-full font-bold shadow-lg shadow-salmon/30 hover:bg-[#d66f56] transition-all min-h-[44px]">
              <PlusIcon className="w-[18px] h-[18px]" /> Create List
            </button>
          </Link>
        </div>
      </div>

      {/* Content: Loading, Error, Empty, or Grouped Sections */}
      {isLoading ? (
        <div className="space-y-8">
          <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-[2rem]" />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 font-bold text-lg">Error loading lists</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      ) : !listsData?.items.length ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl font-bold text-gray-800 mb-2">No lists found.</p>
          <p className="text-sm mb-6">
            {typeFilter === 'all'
              ? 'Create your first list to get started.'
              : `No ${typeFilter} lists yet.`}
          </p>
          <Link href="/lists/new">
            <button className="flex items-center gap-2 px-5 py-2 bg-salmon text-white rounded-full font-bold shadow-lg shadow-salmon/30 hover:bg-[#d66f56] transition-all min-h-[44px] mx-auto">
              <PlusIcon className="w-[18px] h-[18px]" /> Create your first list
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lists grouped by occasion */}
          {Object.values(groupedLists.withOccasion).map(({ occasion, lists }) => (
            <section
              key={occasion.id}
              className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-charcoal mb-6 ml-2">
                {occasion.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            </section>
          ))}

          {/* Lists without occasion */}
          {groupedLists.withoutOccasion.length > 0 && (
            <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-charcoal mb-6 ml-2">
                General & Other
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedLists.withoutOccasion.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

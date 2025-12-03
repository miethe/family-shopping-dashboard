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
import { AddListModal } from '@/components/lists/AddListModal';
import { FilterIcon, ArrowUpDownIcon, PlusIcon, HeartIcon, LightbulbIcon, CheckIcon } from '@/components/layout/icons';
import { cn } from '@/lib/utils';
import type { ListType, GiftList } from '@/types';

type ListTypeFilter = 'all' | ListType;

export default function ListsPage() {
  const [typeFilter, setTypeFilter] = useState<ListTypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOccasionId, setSelectedOccasionId] = useState<number | undefined>(undefined);

  // Convert filter for API
  const apiFilter = typeFilter === 'all' ? undefined : typeFilter;

  // Fetch lists with type filter
  const { data: listsData, isLoading: listsLoading, error } = useLists({ type: apiFilter });

  // Fetch occasions for grouping
  const { data: occasionsData, isLoading: occasionsLoading } = useOccasions(undefined, { disableRealtime: true });

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

  // Get recent lists for activity sidebar (sorted by updated_at)
  const recentLists = useMemo(() => {
    if (!listsData?.items) return [];
    return [...listsData.items]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [listsData]);

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

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
          <button
            onClick={() => {
              setSelectedOccasionId(undefined);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-salmon text-white rounded-full font-bold shadow-lg shadow-salmon/30 hover:bg-[#d66f56] transition-all min-h-[44px]"
          >
            <PlusIcon className="w-[18px] h-[18px]" /> Create List
          </button>
        </div>
      </div>

      {/* Content: Loading, Error, Empty, or 3-Column Grid Layout */}
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
          <button
            onClick={() => {
              setSelectedOccasionId(undefined);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-salmon text-white rounded-full font-bold shadow-lg shadow-salmon/30 hover:bg-[#d66f56] transition-all min-h-[44px] mx-auto"
          >
            <PlusIcon className="w-[18px] h-[18px]" /> Create your first list
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns: Grouped Sections - Full width on mobile, 2 cols on desktop */}
          <div className="w-full lg:col-span-2 space-y-8">
            {/* Lists grouped by occasion */}
            {Object.values(groupedLists.withOccasion).map(({ occasion, lists }) => (
              <section
                key={occasion.id}
                className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-charcoal mb-6 ml-2">
                  {occasion.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lists.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                  {/* Placeholder card for new list */}
                  <button
                    onClick={() => {
                      setSelectedOccasionId(occasion.id);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 hover:border-salmon hover:bg-red-50/50 text-slate-400 hover:text-salmon transition-all"
                  >
                    <PlusIcon className="w-10 h-10 mb-2" />
                    <span className="font-bold text-sm">New Gift List</span>
                  </button>
                </div>
              </section>
            ))}

            {/* Lists without occasion */}
            {groupedLists.withoutOccasion.length > 0 && (
              <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-charcoal mb-6 ml-2">
                  General & Other
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupedLists.withoutOccasion.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                  {/* Placeholder card for new list */}
                  <button
                    onClick={() => {
                      setSelectedOccasionId(undefined);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 hover:border-salmon hover:bg-red-50/50 text-slate-400 hover:text-salmon transition-all"
                  >
                    <PlusIcon className="w-10 h-10 mb-2" />
                    <span className="font-bold text-sm">New Wish List</span>
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Recent Activity Sidebar - Full width on mobile, sticky on desktop */}
          <div className="w-full lg:col-span-1 lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent List Activity</h2>
            <div className="space-y-6">
              {recentLists.map((list) => {
                const occasion = occasionsData?.items?.find((o) => o.id === list.occasion_id);
                const isActive = list.visibility === 'family' || list.visibility === 'public';

                return (
                  <Link key={list.id} href={`/lists/${list.id}`}>
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        {/* Icon */}
                        <div className={cn(
                          'p-3 rounded-xl',
                          list.type === 'wishlist' && 'bg-red-100',
                          list.type === 'ideas' && 'bg-yellow-100',
                          list.type === 'assigned' && 'bg-blue-100'
                        )}>
                          {list.type === 'wishlist' && (
                            <HeartIcon className="w-6 h-6 text-red-500" />
                          )}
                          {list.type === 'ideas' && (
                            <LightbulbIcon className="w-6 h-6 text-yellow-600" />
                          )}
                          {list.type === 'assigned' && (
                            <CheckIcon className="w-6 h-6 text-blue-600" />
                          )}
                        </div>

                        {/* Status Badge */}
                        <span className={cn(
                          'px-3 py-1 text-xs font-bold rounded-full',
                          isActive
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-slate-100 text-slate-500'
                        )}>
                          {isActive ? 'Ongoing' : 'Private'}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bold text-slate-800 mb-2">{list.name}</h4>

                      {/* Item count and occasion */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-slate-500">{list.item_count || 0} items</span>
                        {occasion && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500">{occasion.name}</span>
                          </>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                        Updated <span className="text-slate-800 font-semibold">{formatRelativeTime(list.updated_at)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add List Modal */}
      <AddListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        occasionId={selectedOccasionId}
      />
    </div>
  );
}

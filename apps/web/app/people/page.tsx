'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AddPersonModal } from '@/components/people/AddPersonModal';
import { PersonCard } from '@/components/people/PersonCard';
import { OccasionDetailModal, useEntityModal } from '@/components/modals';
import type { Person, Occasion } from '@/types';

/**
 * Recipients Page (V2 Design)
 *
 * Features:
 * - 12-column grid layout with sidebar
 * - Horizontal scrolling upcoming occasions
 * - Filter tabs for recipient groups
 * - Recipients grid with cards
 * - Recent updates sidebar
 * - Recipient details modal with personal info and gifting history
 */

type GroupFilter = 'all' | 'household' | 'family' | 'friends' | 'other';

export default function RecipientsPage() {
  const [cursor, setCursor] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: personsData, isLoading: personsLoading, error: personsError } = usePersons({ cursor });
  const { data: occasionsData, isLoading: occasionsLoading } = useOccasions({ filter: 'upcoming' }, { disableRealtime: true });
  const { open, entityId, openModal, closeModal } = useEntityModal('occasion');

  // Map relationship to group (normalize to lowercase for matching)
  const getGroup = (relationship?: string): GroupFilter => {
    if (!relationship) return 'other';
    const rel = relationship.toLowerCase();
    if (['spouse', 'partner', 'child', 'kid'].some(r => rel.includes(r))) return 'household';
    if (['parent', 'sibling', 'grandparent', 'cousin', 'uncle', 'aunt', 'mom', 'dad', 'brother', 'sister'].some(r => rel.includes(r))) return 'family';
    if (rel.includes('friend')) return 'friends';
    return 'other';
  };

  // Filter recipients by search and group
  const filteredPeople = useMemo(() => {
    if (!personsData?.items) return [];

    let filtered = personsData.items;

    // Group filter
    if (selectedGroup !== 'all') {
      filtered = filtered.filter((person: Person) =>
        getGroup(person.relationship) === selectedGroup
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((person: Person) => {
        return (
          person.display_name.toLowerCase().includes(query) ||
          person.relationship?.toLowerCase().includes(query) ||
          person.interests?.some(interest => interest.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [personsData?.items, searchQuery, selectedGroup]);

  // Count recipients by group
  const groupCounts = useMemo(() => {
    if (!personsData?.items) return { all: 0, household: 0, family: 0, friends: 0, other: 0 };

    const counts = { all: personsData.items.length, household: 0, family: 0, friends: 0, other: 0 };
    personsData.items.forEach((person: Person) => {
      const group = getGroup(person.relationship);
      counts[group]++;
    });
    return counts;
  }, [personsData?.items]);

  // Calculate time until occasion
  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 14) return 'in 1 week';
    if (diffDays < 30) return `in ${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 60) return 'in 1 month';
    return `in ${Math.floor(diffDays / 30)} months`;
  };

  // Get color for occasion urgency
  const getOccasionColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'bg-primary';
    if (diffDays <= 7) return 'bg-status-warning-500';
    if (diffDays <= 14) return 'bg-status-info-500';
    return 'bg-status-progress-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">All Recipients</h1>
            <p className="text-slate-500 mt-1">
              {groupCounts.all} Recipients, organized in {Object.values(groupCounts).filter(c => c > 0).length - 1} groups
            </p>
          </div>
          <Button
            size="lg"
            className="min-h-[44px]"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Person
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* Upcoming Occasions Section */}
          {!occasionsLoading && occasionsData?.items && occasionsData.items.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Upcoming Occasions</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {occasionsData.items.slice(0, 5).map((occasion: Occasion) => (
                  <button
                    key={occasion.id}
                    onClick={() => openModal(String(occasion.id))}
                    className="flex-shrink-0 w-64 bg-white p-5 rounded-3xl shadow-card text-center relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${getOccasionColor(occasion.date)}`}></div>
                    <p className="font-bold text-slate-800 text-lg">{occasion.name}</p>
                    <p className={`text-sm font-bold ${
                      getTimeUntil(occasion.date).includes('Tomorrow') || getTimeUntil(occasion.date) === 'Today'
                        ? 'text-primary'
                        : 'text-slate-400'
                    }`}>
                      {getTimeUntil(occasion.date)}
                    </p>
                    <div className="flex justify-center -space-x-2 mt-4">
                      {/* Avatar placeholder - could be enhanced with actual recipient avatars */}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {occasion.name.charAt(0)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center bg-white p-1 rounded-full shadow-sm overflow-x-auto w-full sm:w-auto scrollbar-hide">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'all'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                All ({groupCounts.all})
              </button>
              <button
                onClick={() => setSelectedGroup('household')}
                className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'household'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Household ({groupCounts.household})
              </button>
              <button
                onClick={() => setSelectedGroup('family')}
                className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'family'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Family ({groupCounts.family})
              </button>
              <button
                onClick={() => setSelectedGroup('friends')}
                className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'friends'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Friends ({groupCounts.friends})
              </button>
              <button
                onClick={() => setSelectedGroup('other')}
                className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'other'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Other ({groupCounts.other})
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search recipients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border-none rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {personsLoading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
              ))}
            </div>
          ) : personsError ? (
            /* Error State */
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Error loading recipients</p>
              <p className="text-gray-500 text-sm mt-2">
                {personsError instanceof Error ? personsError.message : 'An unknown error occurred'}
              </p>
            </div>
          ) : (
            <>
              {/* Recipients Grid */}
              {filteredPeople.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No recipients found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery ? 'Try adjusting your search' : 'Add your first recipient to get started'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredPeople.map((person: Person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {personsData?.has_more && !searchQuery && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCursor(personsData.next_cursor ?? undefined)}
                    className="min-h-[44px]"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar: Recent Updates */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-8 rounded-3xl shadow-soft h-full">
            <h2 className="text-xl font-bold mb-8 text-slate-800">Recent Updates</h2>
            <ul className="space-y-6">
              {/* Placeholder recent updates - could be enhanced with actual activity feed */}
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                  👤
                </div>
                <div>
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-900">You</span> added a new recipient.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Recently</p>
                </div>
              </li>
              {filteredPeople.slice(0, 3).map((person: Person) => (
                <li key={person.id} className="flex gap-4 items-start">
                  {person.photo_url ? (
                    <Image
                      src={person.photo_url}
                      alt={person.display_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                      {person.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">
                      <span className="font-bold text-slate-900">{person.display_name}</span> profile updated.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Recently</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // React Query will automatically refetch the persons list
        }}
      />

      {/* Occasion Detail Modal */}
      <OccasionDetailModal
        occasionId={entityId}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeModal();
        }}
      />
    </div>
  );
}

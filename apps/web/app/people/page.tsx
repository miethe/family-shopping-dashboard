'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [selectedRecipient, setSelectedRecipient] = useState<Person | null>(null);

  const { data: personsData, isLoading: personsLoading, error: personsError } = usePersons({ cursor });
  const { data: occasionsData, isLoading: occasionsLoading } = useOccasions({ filter: 'upcoming' });

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

  // Check if person has upcoming occasion
  const hasUpcomingOccasion = (person: Person) => {
    if (!person.birthdate) return false;
    const today = new Date();
    const birthdate = new Date(person.birthdate);
    const nextBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const diffDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          <Link href="/people/new">
            <Button size="lg" className="min-h-[44px]">Add Person</Button>
          </Link>
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
                  <div
                    key={occasion.id}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center bg-white p-1 rounded-full shadow-sm">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'all'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                All ({groupCounts.all})
              </button>
              <button
                onClick={() => setSelectedGroup('household')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'household'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Household ({groupCounts.household})
              </button>
              <button
                onClick={() => setSelectedGroup('family')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'family'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Family ({groupCounts.family})
              </button>
              <button
                onClick={() => setSelectedGroup('friends')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                  selectedGroup === 'friends'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Friends ({groupCounts.friends})
              </button>
              <button
                onClick={() => setSelectedGroup('other')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredPeople.map((person: Person) => (
                    <div
                      key={person.id}
                      onClick={() => setSelectedRecipient(person)}
                      className="bg-white p-6 rounded-3xl text-center shadow-card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="relative inline-block">
                        {person.photo_url ? (
                          <Image
                            src={person.photo_url}
                            alt={person.display_name}
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-transparent group-hover:border-primary/20 transition-all"
                            unoptimized
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full mx-auto bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-600 border-4 border-transparent group-hover:border-primary/20 transition-all">
                            {person.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {hasUpcomingOccasion(person) && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <h3 className="mt-4 font-bold text-slate-800 text-lg">{person.display_name}</h3>
                      {person.relationship && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full capitalize">
                          {getGroup(person.relationship)}
                        </span>
                      )}
                    </div>
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

      {/* Recipient Details Modal */}
      <Dialog open={!!selectedRecipient} onOpenChange={() => setSelectedRecipient(null)}>
        <DialogContent className="max-w-5xl p-0 rounded-3xl">
          {selectedRecipient && (
            <div className="relative">
              {/* Header with Background Color */}
              <div className="bg-background-light p-8 rounded-t-3xl text-center relative z-0">
                <div className="relative inline-block -mb-16">
                  {selectedRecipient.photo_url ? (
                    <Image
                      src={selectedRecipient.photo_url}
                      alt={selectedRecipient.display_name}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full border-8 border-white shadow-xl object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-8 border-white shadow-xl bg-slate-200 flex items-center justify-center text-5xl font-bold text-slate-600">
                      {selectedRecipient.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white pt-20 px-8 pb-10 rounded-b-3xl -mt-8 relative z-10">
                <div className="text-center mb-8">
                  <DialogTitle className="text-3xl font-bold text-slate-900">
                    {selectedRecipient.display_name}
                  </DialogTitle>
                  {selectedRecipient.relationship && (
                    <span className="inline-block mt-2 px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-full capitalize">
                      {getGroup(selectedRecipient.relationship)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">Personal Info</h3>
                    <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                      {selectedRecipient.birthdate && (
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.706 2.706 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zM3 10h18V6a2 2 0 00-2-2H5a2 2 0 00-2 2v4z" />
                          </svg>
                          <div>
                            <span className="font-bold text-slate-700">Birthday:</span>{' '}
                            <span className="text-slate-600">{formatDate(selectedRecipient.birthdate)}</span>
                          </div>
                        </div>
                      )}
                      {selectedRecipient.relationship && (
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <span className="font-bold text-slate-700">Relationship:</span>{' '}
                            <span className="text-slate-600">{selectedRecipient.relationship}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedRecipient.sizes && Object.keys(selectedRecipient.sizes).length > 0 && (
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          Sizes
                        </h4>
                        <div className="space-y-2 text-sm text-slate-600">
                          {Object.entries(selectedRecipient.sizes).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}</span>
                              <span className="font-bold">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRecipient.interests && selectedRecipient.interests.length > 0 && (
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-slate-800 mb-3">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipient.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-white text-slate-700 text-xs font-semibold rounded-full border border-slate-200"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800">Gifting History</h3>
                    <div className="space-y-4">
                      {/* Placeholder gifting history - could be enhanced with actual gift data */}
                      <div className="text-center py-8 text-slate-500 text-sm">
                        <p>No gifting history yet</p>
                        <p className="text-xs mt-1">Gifts will appear here once added</p>
                      </div>
                    </div>

                    {selectedRecipient.notes && (
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-slate-800 mb-3">Notes</h4>
                        <p className="text-sm text-slate-600">{selectedRecipient.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

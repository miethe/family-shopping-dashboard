/**
 * Lists Page
 *
 * Displays all gift lists with type filtering.
 * Shows list cards in responsive grid with loading and empty states.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { useLists } from '@/hooks/useLists';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListCard } from '@/components/lists';
import type { ListType } from '@/types';

type ListTypeFilter = 'all' | ListType;

export default function ListsPage() {
  const [typeFilter, setTypeFilter] = useState<ListTypeFilter>('all');

  // Convert filter for API
  const apiFilter = typeFilter === 'all' ? undefined : typeFilter;

  // Fetch lists with type filter
  const { data, isLoading, error } = useLists({ type: apiFilter });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Lists"
        subtitle="Gift lists for occasions and people"
        actions={
          <Link href="/lists/new">
            <Button>Create List</Button>
          </Link>
        }
      />

      {/* Type Filter Tabs */}
      <Tabs
        value={typeFilter}
        onValueChange={(v) => setTypeFilter(v as ListTypeFilter)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlists</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content: Loading, Error, Empty, or Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading lists</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      ) : !data?.items.length ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg mb-2">No lists found.</p>
          <p className="text-sm mb-4">
            {typeFilter === 'all'
              ? 'Create your first list to get started.'
              : `No ${typeFilter} lists yet.`}
          </p>
          <Link href="/lists/new">
            <Button>Create your first list</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}

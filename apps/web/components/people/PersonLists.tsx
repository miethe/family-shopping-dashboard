/**
 * PersonLists Component
 *
 * Lists tab showing gift lists associated with this person.
 * Displays list name, type, and item count with links to each list.
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listApi } from '@/lib/api';
import type { GiftList } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon } from '@/components/layout/icons';
import { AddListModal } from '@/components/lists/AddListModal';
import Link from 'next/link';

interface PersonListsProps {
  personId: number;
}

export function PersonLists({ personId }: PersonListsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lists', 'person', personId],
    queryFn: () => listApi.list({ person_id: personId }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          <p>Error loading lists</p>
        </CardContent>
      </Card>
    );
  }

  const lists = data?.items || [];

  if (lists.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>No gift lists for this person yet.</p>
            <p className="mt-2 text-sm mb-4">Create a list to start adding gift ideas!</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </CardContent>
        </Card>

        <AddListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          personId={personId}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Gift Lists ({lists.length})
        </h3>
        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y divide-gray-200">
          {lists.map((list: GiftList) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors min-h-[60px] flex items-center"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{list.name}</h3>
                  <Badge variant="default" size="sm" className="capitalize">
                    {list.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {list.visibility} visibility
                </p>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </CardContent>
      </Card>

      <AddListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        personId={personId}
      />
    </div>
  );
}

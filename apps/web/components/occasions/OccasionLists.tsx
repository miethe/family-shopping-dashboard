/**
 * OccasionLists Component
 *
 * Displays all gift lists associated with an occasion.
 * Shows list cards with name, type, and item count.
 * Links to individual list detail pages.
 */

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { listApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon } from '@/components/layout/icons';
import type { ListType } from '@/types';

interface OccasionListsProps {
  occasionId: number;
}

// Type badge variants for list type
const listTypeBadgeVariant: Record<ListType, 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
  wishlist: 'success',
  ideas: 'warning',
  assigned: 'info',
};

export function OccasionLists({ occasionId }: OccasionListsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['lists', { occasion_id: occasionId }],
    queryFn: () => listApi.list({ occasion_id: occasionId }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="default" padding="lg">
        <CardContent className="text-center text-red-600">
          <p>Error loading lists for this occasion.</p>
        </CardContent>
      </Card>
    );
  }

  const lists = data?.items || [];

  if (!lists.length) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gift Lists</h3>
        <Card variant="default" padding="lg">
          <CardContent className="text-center">
            <p className="text-gray-500 mb-4">No gift lists for this occasion yet.</p>
            <Button variant="outline" size="default">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gift Lists ({lists.length})
        </h3>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      <div className="space-y-3">
        {lists.map((list) => (
          <Link key={list.id} href={`/lists/${list.id}`} className="block">
            <Card variant="interactive" padding="none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: List info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{list.name}</h4>
                      <Badge variant={listTypeBadgeVariant[list.type]} size="sm">
                        {list.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {list.visibility} • {(list as any).item_count || 0} items
                    </p>
                  </div>

                  {/* Right: Arrow indicator */}
                  <div className="flex-shrink-0 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

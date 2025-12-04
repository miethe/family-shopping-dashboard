'use client';

import Link from 'next/link';
import { useLists } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ListItemWithGift } from '@/types';

export interface GiftUsageProps {
  giftId: number;
}

/**
 * Gift Usage Component
 *
 * Shows which lists contain this gift with their status.
 * For V1 (2-3 users), fetches all lists and filters client-side.
 * Future: Backend should support GET /list-items?gift_id={id}
 */
export function GiftUsage({ giftId }: GiftUsageProps) {
  const { data: listsResponse, isLoading: listsLoading } = useLists();
  const { data: personsResponse } = usePersons();
  const { data: occasionsResponse } = useOccasions();

  const allLists = listsResponse?.items ?? [];
  const persons = personsResponse?.items ?? [];
  const occasions = occasionsResponse?.items ?? [];

  // Filter lists that contain this gift
  // Note: ListWithItems includes items array, so we check if gift_id matches
  const listsWithGift = allLists.filter((list) => {
    // Type assertion since we know lists can have items
    const listWithItems = list as any;
    return listWithItems.items?.some((item: ListItemWithGift) => item.gift_id === giftId);
  });

  // Helper to get list context
  const getListContext = (list: typeof allLists[0]) => {
    const parts: string[] = [];

    if (list.person_id) {
      const person = persons.find((p) => p.id === list.person_id);
      if (person) parts.push(person.display_name);
    }

    if (list.occasion_id) {
      const occasion = occasions.find((o) => o.id === list.occasion_id);
      if (occasion) parts.push(occasion.name);
    }

    return parts.length > 0 ? parts.join(' - ') : null;
  };

  // Helper to get status badge variant
  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'purchased':
        return 'success';
      case 'to_buy':
        return 'warning';
      case 'gifted':
      case 'received':
        return 'success';
      default:
        return 'info';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (listsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Used In Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Used In Lists</CardTitle>
      </CardHeader>
      <CardContent>
        {listsWithGift.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-warm-600 mb-2">
              This gift is not in any lists yet.
            </p>
            <p className="text-xs text-warm-500">
              Edit this gift to add it to lists, or add it from a list page.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {listsWithGift.map((list) => {
              // Find the list item for this gift
              const listWithItems = list as any;
              const listItem = listWithItems.items?.find(
                (item: ListItemWithGift) => item.gift_id === giftId
              );

              return (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="block p-3 rounded-medium border border-border-light hover:border-accent-light hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-warm-900 truncate">
                        {list.name}
                      </h4>
                      {getListContext(list) && (
                        <p className="text-sm text-warm-600 mt-1">
                          {getListContext(list)}
                        </p>
                      )}
                    </div>
                    {listItem && (
                      <Badge variant={getStatusVariant(listItem.status)}>
                        {formatStatus(listItem.status)}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

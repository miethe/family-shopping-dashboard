'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface GiftUsageProps {
  giftId: number;
}

/**
 * Gift Usage Component
 *
 * Shows where this gift is used across lists.
 * V1: Placeholder - Future implementation will query list items by gift_id
 *
 * Future enhancement: Once backend supports GET /list-items?gift_id={id}
 * - Show list of ListItem entries
 * - Display status in each list
 * - Link to list detail pages
 */
export function GiftUsage({ giftId }: GiftUsageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Used In Lists</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm">
          This gift appears in <strong>0</strong> lists.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          List usage tracking coming soon.
        </p>
      </CardContent>
    </Card>
  );
}

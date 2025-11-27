/**
 * PersonHistory Component
 *
 * History tab showing past gifts given to this person.
 * Placeholder for V1 - will be fully implemented in future version.
 */

'use client';

import { Card, CardContent } from '@/components/ui';

interface PersonHistoryProps {
  personId: number;
}

export function PersonHistory({ personId }: PersonHistoryProps) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-gray-500">
        <div className="max-w-md mx-auto space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Gift History Coming Soon</h3>
          <p className="text-sm">
            View past gifts given to this person, including purchase dates and occasions.
          </p>
          <p className="text-xs text-gray-400">
            This feature will be available in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

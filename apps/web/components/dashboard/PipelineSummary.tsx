/**
 * Pipeline Summary
 *
 * Stats showing gift pipeline with icons and counts.
 */

'use client';

import { Card, CardContent } from '@/components/ui';
import { LightbulbIcon, CheckIcon, UserIcon } from '@/components/layout/icons';

interface PipelineSummaryProps {
  ideas: number;
  purchased: number;
  myAssignments: number;
}

export function PipelineSummary({ ideas, purchased, myAssignments }: PipelineSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Ideas */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <LightbulbIcon className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
          <span className="text-2xl font-bold block text-gray-900">{ideas}</span>
          <span className="text-sm text-gray-500 block mt-1">Ideas</span>
        </CardContent>
      </Card>

      {/* Purchased */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <CheckIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
          <span className="text-2xl font-bold block text-gray-900">{purchased}</span>
          <span className="text-sm text-gray-500 block mt-1">Purchased</span>
        </CardContent>
      </Card>

      {/* My Assignments */}
      <Card className="border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4 text-center">
          <UserIcon className="mx-auto h-8 w-8 text-blue-500 mb-2" />
          <span className="text-2xl font-bold block text-gray-900">{myAssignments}</span>
          <span className="text-sm text-gray-500 block mt-1">My Tasks</span>
        </CardContent>
      </Card>
    </div>
  );
}

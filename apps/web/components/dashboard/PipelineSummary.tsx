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
      <Card className="border-warm-200 lift-effect hover:border-status-idea-200 group cursor-default">
        <CardContent className="p-4 text-center">
          <LightbulbIcon className="mx-auto h-8 w-8 text-status-idea-500 mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <span className="text-2xl font-bold block text-warm-900">{ideas}</span>
          <span className="text-sm text-warm-600 block mt-1">Ideas</span>
        </CardContent>
      </Card>

      {/* Purchased */}
      <Card className="border-warm-200 lift-effect hover:border-status-success-200 group cursor-default">
        <CardContent className="p-4 text-center">
          <CheckIcon className="mx-auto h-8 w-8 text-status-success-500 mb-2 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-2xl font-bold block text-warm-900">{purchased}</span>
          <span className="text-sm text-warm-600 block mt-1">Purchased</span>
        </CardContent>
      </Card>

      {/* My Assignments */}
      <Card className="border-warm-200 lift-effect hover:border-status-info-200 group cursor-default">
        <CardContent className="p-4 text-center">
          <UserIcon className="mx-auto h-8 w-8 text-status-info-500 mb-2 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-2xl font-bold block text-warm-900">{myAssignments}</span>
          <span className="text-sm text-warm-600 block mt-1">My Tasks</span>
        </CardContent>
      </Card>
    </div>
  );
}

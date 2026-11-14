'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ColumnStatus = 'idea' | 'shortlisted' | 'buying' | 'ordered' | 'purchased' | 'delivered' | 'gifted';

interface KanbanColumnProps {
  status: ColumnStatus;
  title: string;
  count: number;
  children: React.ReactNode;
}

const statusConfig: Record<ColumnStatus, { headerBg: string; headerText: string; headerBorder: string }> = {
  idea: { headerBg: 'bg-status-idea-100', headerText: 'text-status-idea-800', headerBorder: 'border-status-idea-300' },
  shortlisted: { headerBg: 'bg-status-idea-100', headerText: 'text-status-idea-800', headerBorder: 'border-status-idea-300' },
  buying: { headerBg: 'bg-status-progress-100', headerText: 'text-status-progress-800', headerBorder: 'border-status-progress-300' },
  ordered: { headerBg: 'bg-status-progress-100', headerText: 'text-status-progress-800', headerBorder: 'border-status-progress-300' },
  purchased: { headerBg: 'bg-status-success-100', headerText: 'text-status-success-800', headerBorder: 'border-status-success-300' },
  delivered: { headerBg: 'bg-status-success-100', headerText: 'text-status-success-800', headerBorder: 'border-status-success-300' },
  gifted: { headerBg: 'bg-status-success-100', headerText: 'text-status-success-800', headerBorder: 'border-status-success-300' },
};

export function KanbanColumn({ status, title, count, children }: KanbanColumnProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col min-w-[280px] md:min-w-[320px]">
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-t-large border-2 border-b-0',
          config.headerBg,
          config.headerBorder
        )}
      >
        <h3 className={cn('font-semibold', config.headerText)}>{title}</h3>
        <span
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
            config.headerBg,
            config.headerText,
            'bg-white/50'
          )}
        >
          {count}
        </span>
      </div>

      {/* Body */}
      <div
        className={cn(
          'flex-1 flex flex-col gap-3 p-3 rounded-b-large border-2 border-t-0 min-h-[200px]',
          'bg-warm-50',
          config.headerBorder
        )}
      >
        {children}
      </div>
    </div>
  );
}

export type { ColumnStatus, KanbanColumnProps };

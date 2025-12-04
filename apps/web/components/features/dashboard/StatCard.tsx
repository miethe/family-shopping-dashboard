'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type StatType = 'ideas' | 'toBuy' | 'purchased';

interface StatCardProps {
  type: StatType;
  count: number;
  label: string;
  onClick?: () => void;
}

const statConfig: Record<
  StatType,
  {
    gradient: string;
    border: string;
    text: string;
    numberColor: string;
  }
> = {
  ideas: {
    gradient: 'from-status-idea-50 to-status-idea-100',
    border: 'border-status-idea-300',
    text: 'text-status-idea-800',
    numberColor: 'text-status-idea-600',
  },
  toBuy: {
    gradient: 'from-status-progress-50 to-status-progress-100',
    border: 'border-status-progress-300',
    text: 'text-status-progress-800',
    numberColor: 'text-status-progress-600',
  },
  purchased: {
    gradient: 'from-status-success-50 to-status-success-100',
    border: 'border-status-success-300',
    text: 'text-status-success-800',
    numberColor: 'text-status-success-600',
  },
};

export function StatCard({ type, count, label, onClick }: StatCardProps) {
  const config = statConfig[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-6 md:p-8 rounded-2xlarge border-2 shadow-medium',
        'bg-gradient-to-br transition-all duration-300 ease-out',
        'hover:shadow-high hover:scale-[1.02] active:scale-[0.98]',
        'min-w-[100px] min-h-[100px]',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        config.gradient,
        config.border
      )}
      aria-label={`${label}: ${count}`}
    >
      <span
        className={cn('text-4xl md:text-5xl font-extrabold', config.numberColor)}
        aria-hidden="true"
      >
        {count}
      </span>
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-wide mt-1 md:mt-2',
          config.text
        )}
        aria-hidden="true"
      >
        {label}
      </span>
    </button>
  );
}

export type { StatType, StatCardProps };

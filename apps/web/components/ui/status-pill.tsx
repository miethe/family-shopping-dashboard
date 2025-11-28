'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type GiftStatus = 'idea' | 'shortlisted' | 'buying' | 'ordered' | 'purchased' | 'delivered' | 'gifted' | 'urgent';

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: GiftStatus;
  withDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const statusConfig: Record<GiftStatus, { bg: string; text: string; border: string; dot: string; label: string }> = {
  idea: {
    bg: 'bg-status-idea-100',
    text: 'text-status-idea-800',
    border: 'border-status-idea-300',
    dot: 'bg-status-idea-600',
    label: 'Idea',
  },
  shortlisted: {
    bg: 'bg-status-idea-100',
    text: 'text-status-idea-800',
    border: 'border-status-idea-300',
    dot: 'bg-status-idea-600',
    label: 'Shortlisted',
  },
  buying: {
    bg: 'bg-status-progress-100',
    text: 'text-status-progress-800',
    border: 'border-status-progress-300',
    dot: 'bg-status-progress-600',
    label: 'Buying',
  },
  ordered: {
    bg: 'bg-status-progress-100',
    text: 'text-status-progress-800',
    border: 'border-status-progress-300',
    dot: 'bg-status-progress-600',
    label: 'Ordered',
  },
  purchased: {
    bg: 'bg-status-success-100',
    text: 'text-status-success-800',
    border: 'border-status-success-300',
    dot: 'bg-status-success-600',
    label: 'Purchased',
  },
  delivered: {
    bg: 'bg-status-success-100',
    text: 'text-status-success-800',
    border: 'border-status-success-300',
    dot: 'bg-status-success-600',
    label: 'Delivered',
  },
  gifted: {
    bg: 'bg-status-success-100',
    text: 'text-status-success-800',
    border: 'border-status-success-300',
    dot: 'bg-status-success-600',
    label: 'Gifted',
  },
  urgent: {
    bg: 'bg-status-warning-100',
    text: 'text-status-warning-800',
    border: 'border-status-warning-300',
    dot: 'bg-status-warning-600',
    label: 'Urgent',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm',
};

const dotSizeClasses = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

export function StatusPill({
  status,
  withDot = true,
  size = 'md',
  animated = false,
  className,
  ...props
}: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-small border',
        'transition-all duration-300 ease-out',
        animated && 'animate-scale-in',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            'rounded-full transition-colors duration-300',
            dotSizeClasses[size],
            config.dot
          )}
        />
      )}
      {config.label}
    </span>
  );
}

export type { GiftStatus, StatusPillProps };

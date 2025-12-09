'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// All gift status values matching backend schema
type GiftStatus = 'idea' | 'selected' | 'purchased' | 'received';

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: GiftStatus;
  withDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  /**
   * Optional accessible label override
   * If not provided, uses status label from config
   */
  ariaLabel?: string;
}

const statusConfig: Record<GiftStatus, { bg: string; text: string; border: string; dot: string; label: string }> = {
  idea: {
    bg: 'bg-status-idea-100',
    text: 'text-status-idea-text',
    border: 'border-status-idea-500',
    dot: 'bg-status-idea-700',
    label: 'Idea',
  },
  selected: {
    bg: 'bg-status-progress-100',
    text: 'text-status-progress-700',
    border: 'border-status-progress-500',
    dot: 'bg-status-progress-700',
    label: 'Selected',
  },
  purchased: {
    bg: 'bg-status-purchased-100',
    text: 'text-status-purchased-text',
    border: 'border-status-purchased-500',
    dot: 'bg-status-purchased-700',
    label: 'Purchased',
  },
  received: {
    bg: 'bg-status-success-100',
    text: 'text-status-success-700',
    border: 'border-status-success-500',
    dot: 'bg-status-success-700',
    label: 'Received',
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
  ariaLabel,
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
      role="status"
      aria-label={ariaLabel || `Status: ${config.label}`}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            'rounded-full transition-colors duration-300',
            dotSizeClasses[size],
            config.dot
          )}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}

export type { GiftStatus, StatusPillProps };

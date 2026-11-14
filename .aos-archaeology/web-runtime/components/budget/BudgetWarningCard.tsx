'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type WarningSeverity = 'none' | 'approaching' | 'near_limit' | 'exceeded';

interface BudgetWarning {
  level: WarningSeverity;
  message: string;
  threshold_percent: number;
  current_percent: number;
}

interface BudgetWarningCardProps {
  warning: BudgetWarning;
  onDismiss?: () => void;
  className?: string;
}

const warningCardVariants = cva(
  'flex items-start gap-3 p-4 rounded-lg border transition-all duration-200',
  {
    variants: {
      severity: {
        none: 'hidden',
        approaching: 'bg-amber-50 border-amber-200 text-amber-900',
        near_limit: 'bg-orange-50 border-orange-200 text-orange-900',
        exceeded: 'bg-red-50 border-red-200 text-red-900',
      },
    },
    defaultVariants: {
      severity: 'none',
    },
  }
);

// Icon mapping by severity
const severityIconMap = {
  none: null,
  approaching: '⚠️',
  near_limit: '⛔',
  exceeded: '🚨',
} as const;

// Accessible label mapping
const severityLabelMap = {
  none: '',
  approaching: 'Warning: Approaching budget limit',
  near_limit: 'Caution: Near budget limit',
  exceeded: 'Alert: Budget exceeded',
} as const;

export function BudgetWarningCard({
  warning,
  onDismiss,
  className,
}: BudgetWarningCardProps) {
  // Don't render if severity is 'none'
  if (warning.level === 'none') {
    return null;
  }

  const icon = severityIconMap[warning.level];
  const ariaLabel = severityLabelMap[warning.level];

  return (
    <div
      className={cn(warningCardVariants({ severity: warning.level }), className)}
      role="alert"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {/* Icon */}
      {icon && (
        <span
          className="text-xl leading-none flex-shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">
          {warning.message}
        </p>
        <p className="text-xs mt-1 opacity-80">
          {warning.current_percent.toFixed(0)}% of budget used
        </p>
      </div>

      {/* Dismiss Button (optional) */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-2 rounded-md hover:bg-black/5 active:bg-black/10 transition-colors"
          aria-label="Dismiss warning"
          type="button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

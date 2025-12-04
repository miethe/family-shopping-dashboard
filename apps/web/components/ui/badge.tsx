import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-small border transition-all duration-200',
  {
    variants: {
      variant: {
        // ACCESSIBILITY FIX: Improved contrast ratios for WCAG AA compliance (4.5:1 minimum)
        // Changed from -800 text to -900 text for better contrast on -100 backgrounds
        default: 'bg-warm-100 text-warm-900 border-warm-300',
        idea: 'bg-status-idea-100 text-status-idea-900 border-status-idea-300',
        purchased: 'bg-status-success-100 text-status-success-900 border-status-success-300',
        progress: 'bg-status-progress-100 text-status-progress-900 border-status-progress-300',
        urgent: 'bg-status-warning-100 text-status-warning-900 border-status-warning-300',
        primary: 'bg-primary-100 text-primary-900 border-primary-300',
        success: 'bg-status-success-100 text-status-success-900 border-status-success-300',
        warning: 'bg-status-warning-100 text-status-warning-900 border-status-warning-300',
        error: 'bg-status-error-100 text-status-error-900 border-status-error-300',
        info: 'bg-status-info-100 text-status-info-900 border-status-info-300',
      },
      size: {
        sm: 'px-2 py-1 text-[10px]',
        default: 'px-3 py-1.5 text-xs',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Mapping of variant to dot indicator color
const dotColorMap = {
  default: 'bg-warm-600',
  idea: 'bg-status-idea-600',
  purchased: 'bg-status-success-600',
  progress: 'bg-status-progress-600',
  urgent: 'bg-status-warning-600',
  primary: 'bg-primary-600',
  success: 'bg-status-success-600',
  warning: 'bg-status-warning-600',
  error: 'bg-status-error-600',
  info: 'bg-status-info-600',
} as const;

// Mapping of variant to accessible label descriptions
const variantLabelMap = {
  default: 'Status',
  idea: 'Idea status',
  purchased: 'Purchased status',
  progress: 'In progress status',
  urgent: 'Urgent status',
  primary: 'Primary status',
  success: 'Success status',
  warning: 'Warning status',
  error: 'Error status',
  info: 'Info status',
} as const;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
  /**
   * Optional accessible label for screen readers
   * If not provided, uses variant name as fallback
   */
  ariaLabel?: string;
}

function Badge({
  className,
  variant = 'default',
  size,
  withDot = false,
  ariaLabel,
  children,
  ...props
}: BadgeProps) {
  const dotColor = dotColorMap[variant ?? 'default'];
  const defaultLabel = variantLabelMap[variant ?? 'default'];

  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      role="status"
      aria-label={ariaLabel || `${defaultLabel}: ${children}`}
      {...props}
    >
      {withDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColor)}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

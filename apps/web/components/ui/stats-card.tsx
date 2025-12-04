import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statsCardVariants = cva(
  'flex flex-col items-center justify-center rounded-2xlarge p-6 transition-all duration-200 ease-out cursor-default min-h-[120px]',
  {
    variants: {
      variant: {
        default: 'bg-warm-100 text-warm-900 shadow-low hover:shadow-medium hover:-translate-y-0.5',
        primary: 'bg-primary-500 text-white shadow-shadow-primary hover:shadow-high hover:-translate-y-0.5',
        idea: 'bg-status-idea-100 text-status-idea-text shadow-low hover:shadow-medium hover:-translate-y-0.5',
        success: 'bg-status-success-100 text-status-success-text shadow-low hover:shadow-medium hover:-translate-y-0.5',
        warning: 'bg-status-warning-100 text-status-warning-700 shadow-low hover:shadow-medium hover:-translate-y-0.5',
        mustard: 'bg-mustard text-status-idea-text shadow-low hover:shadow-medium hover:-translate-y-0.5',
        salmon: 'bg-salmon text-white shadow-low hover:shadow-medium hover:-translate-y-0.5',
        sage: 'bg-sage text-white shadow-low hover:shadow-medium hover:-translate-y-0.5',
      },
      clickable: {
        true: 'cursor-pointer active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      clickable: false,
    },
  }
);

export interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  valueClassName?: string;
  labelClassName?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      className,
      variant,
      clickable,
      label,
      value,
      icon,
      valueClassName,
      labelClassName,
      onClick,
      ...props
    },
    ref
  ) => {
    // Auto-detect clickable if onClick is provided
    const isClickable = clickable ?? !!onClick;

    return (
      <div
        ref={ref}
        className={cn(
          statsCardVariants({ variant, clickable: isClickable }),
          className
        )}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(e as any);
                }
              }
            : undefined
        }
        {...props}
      >
        {icon && (
          <div className="mb-2 flex items-center justify-center opacity-80">
            {icon}
          </div>
        )}
        <span
          className={cn(
            'text-sm font-semibold opacity-80 mb-1',
            labelClassName
          )}
        >
          {label}
        </span>
        <span
          className={cn('text-4xl font-bold', valueClassName)}
        >
          {value}
        </span>
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export { StatsCard, statsCardVariants };

/**
 * Timeline UI Primitive
 *
 * Reusable timeline component for displaying chronological activity.
 * Features vertical connector line, status-based dot colors, and animation support.
 *
 * @example
 * ```tsx
 * <Timeline>
 *   <TimelineItem>
 *     <TimelineDot variant="success" />
 *     <TimelineContent>
 *       <TimelineTitle>Sarah added a gift</TimelineTitle>
 *       <TimelineDescription>Added "Wireless Headphones" to Holiday List</TimelineDescription>
 *       <TimelineTime dateTime="2024-12-01T14:30:00">2 hours ago</TimelineTime>
 *     </TimelineContent>
 *   </TimelineItem>
 *   <TimelineItem>
 *     <TimelineDot variant="info" />
 *     <TimelineContent>
 *       <TimelineTitle>Mike marked item as purchased</TimelineTitle>
 *       <TimelineTime>4 hours ago</TimelineTime>
 *     </TimelineContent>
 *   </TimelineItem>
 *   <TimelineItem showConnector={false}>
 *     <TimelineDot variant="default" />
 *     <TimelineContent>
 *       <TimelineTitle>Emma commented</TimelineTitle>
 *     </TimelineContent>
 *   </TimelineItem>
 * </Timeline>
 * ```
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Timeline Container
 * Wraps timeline items with relative positioning for connector line
 */
const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn('relative space-y-6', className)}
    {...props}
  />
));
Timeline.displayName = 'Timeline';

/**
 * Timeline Item
 * Individual timeline entry with dot and content
 */
const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    /**
     * Show connector line below this item
     * @default true
     */
    showConnector?: boolean;
  }
>(({ className, showConnector = true, children, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('relative flex gap-4 pb-6 last:pb-0', className)}
    {...props}
  >
    {/* Vertical connector line */}
    {showConnector && (
      <div className="absolute left-[5.5px] top-3 bottom-0 w-px bg-warm-200" />
    )}
    {children}
  </li>
));
TimelineItem.displayName = 'TimelineItem';

/**
 * Timeline Dot Variants
 * Status-based color variants for timeline dots
 */
const timelineDotVariants = cva(
  'relative flex items-center justify-center rounded-full border-2 border-white shadow-low z-10',
  {
    variants: {
      variant: {
        default: 'bg-warm-400',
        success: 'bg-status-success-500',
        warning: 'bg-status-warning-500',
        error: 'bg-status-error-500',
        info: 'bg-status-info-500',
        idea: 'bg-status-idea-500',
        progress: 'bg-status-progress-500',
      },
      size: {
        sm: 'w-2 h-2',
        default: 'w-3 h-3',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Timeline Dot
 * Status indicator dot with optional icon
 */
export interface TimelineDotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineDotVariants> {
  /**
   * Optional icon to display inside dot (for larger sizes)
   */
  icon?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant, size, icon, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(timelineDotVariants({ variant, size }), className)}
      {...props}
    >
      {icon}
    </div>
  )
);
TimelineDot.displayName = 'TimelineDot';

/**
 * Timeline Content
 * Content area to the right of the dot
 */
const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Enable fade-in animation
     * @default false
     */
    animate?: boolean;
  }
>(({ className, animate = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-1 pt-0.5',
      animate && 'animate-fade-in',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
TimelineContent.displayName = 'TimelineContent';

/**
 * Timeline Title
 * Primary title text for timeline item
 */
const TimelineTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm md:text-base font-semibold text-charcoal leading-relaxed', className)}
    {...props}
  />
));
TimelineTitle.displayName = 'TimelineTitle';

/**
 * Timeline Description
 * Secondary description text for timeline item
 */
const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs md:text-sm text-charcoal/70 mt-1', className)}
    {...props}
  />
));
TimelineDescription.displayName = 'TimelineDescription';

/**
 * Timeline Time
 * Timestamp for timeline item
 */
const TimelineTime = React.forwardRef<
  HTMLTimeElement,
  React.TimeHTMLAttributes<HTMLTimeElement>
>(({ className, ...props }, ref) => (
  <time
    ref={ref}
    className={cn('text-xs text-charcoal/60 mt-0.5 block', className)}
    {...props}
  />
));
TimelineTime.displayName = 'TimelineTime';

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  timelineDotVariants,
};

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Icon } from './icon';

const tableVariants = cva(
  'w-full caption-bottom border-collapse',
  {
    variants: {
      variant: {
        default: 'border-separate border-spacing-0',
        bordered: 'border border-border-subtle rounded-large overflow-hidden',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-large border border-border-subtle bg-surface-primary">
        <table
          ref={ref}
          className={cn(tableVariants({ variant, className }))}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-warm-50 border-b border-border-subtle',
      sticky && 'sticky top-0 z-10',
      className
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'bg-warm-50 border-t border-border-subtle font-medium',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const tableRowVariants = cva(
  'border-b border-border-subtle transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'hover:bg-warm-50',
        interactive: 'hover:bg-warm-50 cursor-pointer active:bg-warm-100',
        selected: 'bg-primary-50 hover:bg-primary-100 border-primary-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant, selected, ...props }, ref) => {
    const rowVariant = selected ? 'selected' : variant;
    return (
      <tr
        ref={ref}
        className={cn(tableRowVariants({ variant: rowVariant, className }))}
        aria-selected={selected}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    align?: 'left' | 'center' | 'right';
  }
>(({ className, align = 'left', ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-label-small font-semibold text-warm-700 uppercase tracking-wide',
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    align?: 'left' | 'center' | 'right';
  }
>(({ className, align = 'left', ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 text-body-medium text-warm-900',
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-body-small text-warm-600', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  className?: string;
}

const TablePagination = React.forwardRef<HTMLDivElement, TablePaginationProps>(
  (
    {
      page,
      totalPages,
      onPageChange,
      pageSize,
      totalItems,
      className,
      ...props
    },
    ref
  ) => {
    const canGoBack = page > 1;
    const canGoForward = page < totalPages;

    const handlePrevious = () => {
      if (canGoBack) {
        onPageChange(page - 1);
      }
    };

    const handleNext = () => {
      if (canGoForward) {
        onPageChange(page + 1);
      }
    };

    const startItem = totalItems ? (page - 1) * (pageSize || 10) + 1 : null;
    const endItem = totalItems
      ? Math.min(page * (pageSize || 10), totalItems)
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-warm-50',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {totalItems && pageSize && (
            <p className="text-body-small text-warm-600">
              Showing <span className="font-semibold">{startItem}</span> to{' '}
              <span className="font-semibold">{endItem}</span> of{' '}
              <span className="font-semibold">{totalItems}</span> results
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoBack}
            aria-label="Previous page"
            className="min-w-[44px]"
          >
            <Icon name="chevron_left" size="sm" />
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-body-medium text-warm-900 font-medium px-2">
              Page {page} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoForward}
            aria-label="Next page"
            className="min-w-[44px]"
          >
            <Icon name="chevron_right" size="sm" />
          </Button>
        </div>
      </div>
    );
  }
);
TablePagination.displayName = 'TablePagination';

// Empty state for tables
export interface TableEmptyProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const TableEmpty = React.forwardRef<HTMLDivElement, TableEmptyProps>(
  (
    {
      icon,
      title = 'No data',
      description = 'There are no items to display.',
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        {icon && <div className="mb-4 text-warm-400">{icon}</div>}
        <h3 className="text-heading-3 text-warm-900 mb-2">{title}</h3>
        <p className="text-body-medium text-warm-600 mb-4 max-w-sm">
          {description}
        </p>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
TableEmpty.displayName = 'TableEmpty';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TablePagination,
  TableEmpty,
};

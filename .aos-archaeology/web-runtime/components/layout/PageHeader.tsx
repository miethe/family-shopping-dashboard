'use client';

import Link from 'next/link';
import { ChevronLeftIcon } from './icons';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string | { pathname: string; query?: Record<string, string> };
  /** @deprecated Use breadcrumbItems instead */
  breadcrumb?: React.ReactNode;
  /** Breadcrumb items for navigation path */
  breadcrumbItems?: BreadcrumbItem[];
}

/**
 * Reusable page header component
 * - Consistent page titles across app
 * - Optional back button and breadcrumb navigation
 * - Optional action buttons
 * - Responsive layout with warm colors (Design System V2)
 * - Desktop: Shows breadcrumbs at top
 * - Mobile: Shows back button if needed
 *
 * Usage:
 * <PageHeader
 *   title="Christmas 2024"
 *   subtitle="Gift list for family"
 *   breadcrumbItems={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Lists', href: '/lists' },
 *     { label: 'Christmas 2024' }
 *   ]}
 *   actions={<Button>Add Gift</Button>}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  breadcrumb,
  breadcrumbItems,
}: PageHeaderProps) {
  return (
    <div className="bg-bg-base dark:bg-background-dark">
      <div className="px-4 py-6 md:px-6 md:py-8">
        {/* Breadcrumb Navigation - Desktop */}
        {breadcrumbItems && (
          <div className="hidden md:block mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}

        {/* Legacy breadcrumb support */}
        {breadcrumb && !breadcrumbItems && (
          <div className="mb-2 text-body-small text-warm-500 dark:text-warm-400">
            {breadcrumb}
          </div>
        )}

        {/* Back Button - Mobile */}
        {backHref && (
          <Link
            href={backHref as any}
            className="
              inline-flex items-center gap-2
              text-body-small text-warm-600 hover:text-warm-700
              dark:text-warm-400 dark:hover:text-warm-200
              mb-3
              min-h-[44px]
              transition-colors
              md:hidden
            "
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </Link>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-warm-900 dark:text-warm-100">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-body-medium text-warm-600 dark:text-warm-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

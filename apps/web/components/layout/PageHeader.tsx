'use client';

import Link from 'next/link';
import { ChevronLeftIcon } from './icons';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string | { pathname: string; query?: Record<string, string> };
  breadcrumb?: React.ReactNode;
}

/**
 * Reusable page header component
 * - Consistent page titles across app
 * - Optional back button and breadcrumb
 * - Optional action buttons
 * - Responsive layout with warm colors (Soft Modernity)
 */
export function PageHeader({ title, subtitle, actions, backHref, breadcrumb }: PageHeaderProps) {
  return (
    <div className="bg-bg-base">
      <div className="px-4 py-6 md:px-6 md:py-8">
        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="mb-2 text-body-small text-warm-500">
            {breadcrumb}
          </div>
        )}

        {/* Back Button */}
        {backHref && (
          <Link
            href={backHref as any}
            className="
              inline-flex items-center gap-2
              text-body-small text-warm-600 hover:text-warm-700
              mb-3
              min-h-[44px]
              transition-colors
            "
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </Link>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-warm-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-body-medium text-warm-600">
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

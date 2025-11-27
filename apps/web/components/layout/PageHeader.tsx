'use client';

import Link from 'next/link';
import { ChevronLeftIcon } from './icons';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string | { pathname: string; query?: Record<string, string> };
}

/**
 * Reusable page header component
 * - Consistent page titles across app
 * - Optional back button
 * - Optional action buttons
 * - Responsive layout
 */
export function PageHeader({ title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-4 md:px-6 md:py-6">
        {/* Back Button */}
        {backHref && (
          <Link
            href={backHref as any}
            className="
              inline-flex items-center gap-2
              text-sm text-gray-600 hover:text-gray-900
              mb-3
              min-h-touch
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          {/* Action Buttons */}
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

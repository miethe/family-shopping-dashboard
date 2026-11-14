'use client';

import Link from 'next/link';
import { ChevronRightIcon } from './icons';
import type { Route } from 'next';

export interface BreadcrumbItem {
  label: string;
  href?: Route | string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb component for navigation paths
 * - Shows navigation hierarchy
 * - Mobile-responsive with truncation
 * - Design System V2 styled
 * - Accessible with proper ARIA labels
 *
 * Usage:
 * <Breadcrumb items={[
 *   { label: 'Dashboard', href: '/dashboard' },
 *   { label: 'Lists', href: '/lists' },
 *   { label: 'Christmas 2024' }
 * ]} />
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 ${className}`}>
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href as Route}
                  className="
                    text-body-small text-warm-600 hover:text-warm-800
                    dark:text-warm-400 dark:hover:text-warm-200
                    transition-colors duration-200
                    truncate max-w-[200px] sm:max-w-none
                  "
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`
                    text-body-small truncate max-w-[200px] sm:max-w-none
                    ${isLast
                      ? 'text-warm-900 dark:text-warm-100 font-medium'
                      : 'text-warm-600 dark:text-warm-400'}
                  `}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRightIcon className="w-4 h-4 text-warm-400 dark:text-warm-600 flex-shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

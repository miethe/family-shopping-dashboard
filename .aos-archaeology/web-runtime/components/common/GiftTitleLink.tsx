'use client';

import { ExternalLink } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export interface GiftTitleLinkProps {
  name: string;
  url?: string | null;
  className?: string;
  showExternalIcon?: boolean;
}

/**
 * Gift Title Link Component
 *
 * Displays a gift title as a clickable link if URL exists, otherwise as plain text.
 * Opens external links in new tab with proper security attributes.
 *
 * Mobile-optimized with proper touch targets and visual feedback.
 */
export function GiftTitleLink({
  name,
  url,
  className,
  showExternalIcon = false,
}: GiftTitleLinkProps) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'hover:text-primary-600 hover:underline transition-colors inline-flex items-center gap-1.5',
          className
        )}
      >
        <span>{name}</span>
        {showExternalIcon && (
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
        )}
      </a>
    );
  }

  return <span className={className}>{name}</span>;
}

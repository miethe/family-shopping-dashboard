import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500", "px-4") // "py-1 bg-blue-500 px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a timestamp as relative time (e.g., "2h ago", "3d ago")
 *
 * @param dateString - ISO date string
 * @returns Formatted relative time string
 *
 * @example
 * formatRelativeTime("2024-11-27T10:00:00Z") // "2h ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 7) {
    return `${diffDay}d ago`;
  } else if (diffWeek < 4) {
    return `${diffWeek}w ago`;
  } else if (diffMonth < 12) {
    return `${diffMonth}mo ago`;
  } else {
    return `${diffYear}y ago`;
  }
}

/**
 * Format price value with defensive parsing for both string and number types
 *
 * @param price - Price value (number, string, undefined, or null)
 * @returns Formatted price string with 2 decimal places, or empty string if invalid
 *
 * @example
 * formatPrice(50) // "50.00"
 * formatPrice("50") // "50.00"
 * formatPrice("50.5") // "50.50"
 * formatPrice(null) // ""
 * formatPrice(undefined) // ""
 * formatPrice("invalid") // ""
 */
export function formatPrice(price: number | string | undefined | null): string {
  if (price == null) return '';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? '' : numPrice.toFixed(2);
}

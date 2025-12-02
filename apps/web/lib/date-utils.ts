/**
 * Date Utility Functions
 *
 * Centralized date formatting and calculation utilities to avoid duplication.
 */

/**
 * Format date for display
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate age from birthdate
 * @param birthdate - ISO date string
 * @returns Age in years, or null if invalid date
 */
export function getAge(birthdate: string): number | null {
  try {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
}

/**
 * Get next birthday date with days until calculation
 * @param birthdate - ISO date string
 * @returns Object with formatted date, daysUntil, and isPast flag, or null if invalid
 */
export function getNextBirthday(birthdate: string): {
  date: string;
  daysUntil: number;
  isPast: boolean;
} | null {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birth = new Date(birthdate);
    const thisYear = today.getFullYear();

    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
    nextBirthday.setHours(0, 0, 0, 0);

    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }

    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      date: nextBirthday.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      daysUntil,
      isPast: false, // Next birthday is always in the future
    };
  } catch {
    return null;
  }
}

/**
 * Get days until a specific date
 * @param dateString - ISO date string
 * @returns Number of days until the date (can be negative if past)
 */
export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to midnight

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format relative time (e.g., "2 days ago", "in 5 days")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const days = getDaysUntil(dateString);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/**
 * Format relative time from now (e.g., "2 hours ago", "5 minutes ago")
 * More granular than formatRelativeTime - handles minutes and hours
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date);
  }
}

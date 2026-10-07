/**
 * Date Utilities Tests
 *
 * These tests verify timezone-safe date formatting and calculations.
 */

import { describe, expect, it } from 'vitest';

import {
  parseLocalDate,
  formatDate,
  formatDateCustom,
  getAge,
  getNextBirthday,
  getDaysUntil,
  formatRelativeTime,
} from '../date-utils';

/** YYYY-MM-DD for a Date in LOCAL time (toISOString would use UTC and shift the day). */
function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function offsetDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD as a local date', () => {
    const date = parseLocalDate('2025-01-15');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it('handles leap days', () => {
    const date = parseLocalDate('2024-02-29');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(29);
  });

  it('handles end of month', () => {
    expect(parseLocalDate('2025-01-31').getDate()).toBe(31);
  });

  it('does not shift the date across timezones (CRITICAL)', () => {
    const date = parseLocalDate('2025-01-15');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2025, 0, 15]);
  });
});

describe('formatDate / formatDateCustom', () => {
  it('formats a long date', () => {
    expect(formatDate('2025-01-15')).toBe('January 15, 2025');
  });

  it('formats with custom options', () => {
    expect(formatDateCustom('2025-01-15', { month: 'short', day: 'numeric' })).toBe('Jan 15');
  });
});

describe('getAge', () => {
  it('returns a reasonable age', () => {
    const age = getAge('2000-01-15');
    expect(age).not.toBeNull();
    expect(age!).toBeGreaterThanOrEqual(20);
    expect(age!).toBeLessThanOrEqual(50);
  });

  it('returns null for an invalid date', () => {
    expect(getAge('invalid-date')).toBeNull();
  });
});

describe('getNextBirthday', () => {
  it('returns the next upcoming birthday', () => {
    const next = getNextBirthday('2000-06-15');
    expect(next).not.toBeNull();
    expect(next!.daysUntil).toBeGreaterThanOrEqual(0);
    expect(next!.isPast).toBe(false);
  });

  it('returns null for an invalid date', () => {
    expect(getNextBirthday('invalid-date')).toBeNull();
  });
});

describe('getDaysUntil / formatRelativeTime', () => {
  it('is 0 days until today', () => {
    expect(getDaysUntil(offsetDays(0))).toBe(0);
  });

  it('formats today, tomorrow and yesterday', () => {
    expect(formatRelativeTime(offsetDays(0))).toBe('Today');
    expect(formatRelativeTime(offsetDays(1))).toBe('Tomorrow');
    expect(formatRelativeTime(offsetDays(-1))).toBe('Yesterday');
  });
});

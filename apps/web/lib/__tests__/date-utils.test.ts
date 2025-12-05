/**
 * Date Utilities Manual Tests
 *
 * Run with: node -r esbuild-register lib/__tests__/date-utils.test.ts
 * Or manually verify the functions work correctly.
 *
 * These tests verify timezone-safe date formatting and calculations.
 */

import {
  parseLocalDate,
  formatDate,
  formatDateCustom,
  getAge,
  getNextBirthday,
  getDaysUntil,
  formatRelativeTime,
} from '../date-utils';

// Test helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n🧪 Testing Date Utilities\n');

// Test parseLocalDate
console.log('Testing parseLocalDate...');
const date1 = parseLocalDate('2025-01-15');
assert(date1.getFullYear() === 2025, 'parseLocalDate: year should be 2025');
assert(date1.getMonth() === 0, 'parseLocalDate: month should be 0 (January)');
assert(date1.getDate() === 15, 'parseLocalDate: date should be 15');

// Test leap year
const leapDate = parseLocalDate('2024-02-29');
assert(leapDate.getFullYear() === 2024, 'parseLocalDate: leap year should be 2024');
assert(leapDate.getMonth() === 1, 'parseLocalDate: leap month should be 1 (February)');
assert(leapDate.getDate() === 29, 'parseLocalDate: leap date should be 29');

// Test end of month
const endOfMonth = parseLocalDate('2025-01-31');
assert(endOfMonth.getDate() === 31, 'parseLocalDate: end of month should be 31');

// Test formatDate
console.log('\nTesting formatDate...');
const formatted1 = formatDate('2025-01-15');
assert(formatted1 === 'January 15, 2025', `formatDate: should be "January 15, 2025" but got "${formatted1}"`);

// Test formatDateCustom
console.log('\nTesting formatDateCustom...');
const formatted2 = formatDateCustom('2025-01-15', {
  month: 'short',
  day: 'numeric',
});
assert(formatted2 === 'Jan 15', `formatDateCustom: should be "Jan 15" but got "${formatted2}"`);

// Test getAge
console.log('\nTesting getAge...');
const age = getAge('2000-01-15');
assert(age !== null, 'getAge: should return a number');
assert(age! >= 20 && age! <= 50, `getAge: should be reasonable (20-50) but got ${age}`);

const invalidAge = getAge('invalid-date');
assert(invalidAge === null, 'getAge: should return null for invalid date');

// Test getNextBirthday
console.log('\nTesting getNextBirthday...');
const nextBday = getNextBirthday('2000-06-15');
assert(nextBday !== null, 'getNextBirthday: should return result');
assert(nextBday!.daysUntil >= 0, 'getNextBirthday: daysUntil should be >= 0');
assert(nextBday!.isPast === false, 'getNextBirthday: isPast should be false');

const invalidBday = getNextBirthday('invalid-date');
assert(invalidBday === null, 'getNextBirthday: should return null for invalid date');

// Test getDaysUntil
console.log('\nTesting getDaysUntil...');
const today = new Date();
const todayString = today.toISOString().split('T')[0];
const daysToToday = getDaysUntil(todayString);
assert(daysToToday === 0, `getDaysUntil: should be 0 for today but got ${daysToToday}`);

// Test formatRelativeTime
console.log('\nTesting formatRelativeTime...');
const relToday = formatRelativeTime(todayString);
assert(relToday === 'Today', `formatRelativeTime: should be "Today" but got "${relToday}"`);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowString = tomorrow.toISOString().split('T')[0];
const relTomorrow = formatRelativeTime(tomorrowString);
assert(relTomorrow === 'Tomorrow', `formatRelativeTime: should be "Tomorrow" but got "${relTomorrow}"`);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayString = yesterday.toISOString().split('T')[0];
const relYesterday = formatRelativeTime(yesterdayString);
assert(relYesterday === 'Yesterday', `formatRelativeTime: should be "Yesterday" but got "${relYesterday}"`);

// Critical timezone test
console.log('\n🔍 Testing timezone edge case (CRITICAL)...');
const criticalDate = parseLocalDate('2025-01-15');
assert(
  criticalDate.getDate() === 15 && criticalDate.getMonth() === 0 && criticalDate.getFullYear() === 2025,
  'CRITICAL: parseLocalDate should not shift date across timezones'
);

console.log('\n✨ All tests passed!\n');

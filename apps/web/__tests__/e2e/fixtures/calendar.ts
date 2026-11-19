import type { Page } from '@playwright/test';

const totals = { spent: '12.00', planned: '24.00', purchased_count: 1, unknown_prices: 0, phases: { considering: 1, bought: 1, in_hand: 0, given: 0 } };
const occurrence = (id: number, name: string, date: string, closed: boolean, person: string) => ({
  ...totals, id, occasion_id: id, name, date, closed, budget_total: '100.00', allocated: '50.00', remaining_money: '88.00',
  envelopes: [{ ...totals, id, person_id: id, person_name: person, money_allowance: '50.00', count_allowance: 2, remaining_money: '38.00', remaining_count: 1, gifts: [] }],
});
export const calendarOccurrences = [
  occurrence(1, 'Winter gathering', '2026-12-25', false, 'Wren'),
  occurrence(2, 'January gathering', '2027-01-12', false, 'Rowan'),
  occurrence(3, 'Autumn gathering', '2026-11-08', true, 'Wren'),
];

/** Install deterministic, backend-free data and auth before navigating to /events. */
export async function setupCalendar(page: Page, options: { view?: 'month' | 'upcoming' | 'season' } = {}) {
  await page.clock.setFixedTime(new Date('2026-11-19T12:00:00'));
  await page.addInitScript(({ view }) => {
    localStorage.setItem('auth_token', 'fictional-token');
    localStorage.setItem('auth_token_expiry', '4102444800000');
    if (view) localStorage.setItem('gifting-calendar-view', view);
  }, options);
  await page.route('**/api/v1/**', async route => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'authorization, content-type' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const path = new URL(route.request().url()).pathname;
    const body = path.endsWith('/auth/me')
      ? { id: 1, email: 'wren@example.test', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
      : path.endsWith('/gifting/occurrences') ? calendarOccurrences
      : path.endsWith('/occasions') ? { items: [], total: 0, page: 1, limit: 100 }
      : path.endsWith('/persons') ? { items: [], total: 0, page: 1, limit: 100 }
      : null;
    if (body === null) return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Unstubbed fixture endpoint' } }, headers });
    return route.fulfill({ json: body, headers });
  });
}

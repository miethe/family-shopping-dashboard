import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { EventHome } from '../EventHome';
import { HolidayTheme } from '@/components/providers/HolidayTheme';
import { holidayApi } from '@/lib/api/holidays';
import { occasionApi } from '@/lib/api/endpoints';
import { giftingApi } from '@/lib/api/gifting';
vi.mock('@/hooks/useOccasions', () => ({ useOccasions: () => ({ data: { items: [] } }) }));
vi.mock('@/components/providers/AuthProvider', () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock('@/lib/api/holidays', () => ({ holidayApi: { list: vi.fn(), create: vi.fn(), theme: vi.fn() } }));
vi.mock('@/lib/api/endpoints', () => ({ occasionApi: { create: vi.fn() } }));
vi.mock('@/lib/api/gifting', () => ({ giftingApi: { occurrences: vi.fn(), create: vi.fn() } }));
const holiday = { id: 1, name: 'Christmas', key: 'christmas', month: 12, day: 25, is_major: true, theme_key: 'christmas', theme_window_days: 45, next_date: '2099-12-25', days_until: 32 };
function mount(node: React.ReactNode) {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{node}</QueryClientProvider>);
}
describe('holiday integration', () => {
  it('chooses a major holiday and creates a linked event on its next date', async () => {
    vi.mocked(giftingApi.occurrences).mockResolvedValue([]);
    vi.mocked(holidayApi.list).mockResolvedValue([holiday]);
    vi.mocked(occasionApi.create).mockResolvedValue({ id: 42 } as never);
    vi.mocked(giftingApi.create).mockResolvedValue({} as never);
    const user = userEvent.setup(); mount(<EventHome />);
    await user.click(screen.getByText('Plan an event'));
    await user.selectOptions(screen.getByLabelText('Event'), 'holiday');
    await user.selectOptions(await screen.findByLabelText('Holiday'), '1');
    expect(screen.getByRole('option', { name: /Christmas ★/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Event name/)).toHaveValue('Christmas');
    expect(screen.getByLabelText(/^Date/)).toHaveValue('2099-12-25');
    await user.click(screen.getByRole('button', { name: 'Create occurrence' }));
    await waitFor(() => expect(occasionApi.create).toHaveBeenCalledWith(expect.objectContaining({ holiday_id: 1, date: '2099-12-25', type: 'holiday' })));
  });
  it('sets and removes the theme attribute', async () => {
    vi.mocked(holidayApi.theme).mockResolvedValue({ theme_key: 'christmas' });
    const view = mount(<HolidayTheme />);
    await waitFor(() => expect(document.documentElement.dataset.holidayTheme).toBe('christmas'));
    view.unmount();
    expect(document.documentElement.dataset.holidayTheme).toBeUndefined();
  });
});

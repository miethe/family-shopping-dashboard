import { apiClient } from './client';

export interface Holiday {
  id: number; name: string; key: string; month: number; day: number;
  is_major: boolean; theme_key: string | null; theme_window_days: number;
  next_date: string; days_until: number;
}
export type NewHoliday = Omit<Holiday, 'id' | 'next_date' | 'days_until'>;
export const holidayApi = {
  list: () => apiClient.get<Holiday[]>('/holidays'),
  create: (data: NewHoliday) => apiClient.post<Holiday>('/holidays', data),
  theme: () => apiClient.get<{ theme_key: string | null }>('/holidays/active-theme'),
};

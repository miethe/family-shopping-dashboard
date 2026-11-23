'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthProvider';
import { holidayApi } from '@/lib/api/holidays';

export function HolidayTheme() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({ queryKey: ['holiday-theme'], queryFn: holidayApi.theme, enabled: isAuthenticated, refetchInterval: 60000 });
  useEffect(() => {
    // Future themes can target html[data-holiday-theme]; this hook adds no styling.
    if (isAuthenticated && data?.theme_key) document.documentElement.dataset.holidayTheme = data.theme_key;
    else delete document.documentElement.dataset.holidayTheme;
    return () => { delete document.documentElement.dataset.holidayTheme; };
  }, [isAuthenticated, data]);
  return null;
}

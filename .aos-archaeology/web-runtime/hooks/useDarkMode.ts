'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'theme-preference';

type Theme = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
  /** Current theme setting: 'light', 'dark', or 'system' */
  theme: Theme;
  /** Whether dark mode is currently active (resolved from system if theme is 'system') */
  isDark: boolean;
  /** Set the theme to a specific value */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

/**
 * Hook for managing dark mode with localStorage persistence and system preference support.
 *
 * @example
 * const { theme, isDark, setTheme, toggleTheme } = useDarkMode();
 *
 * // Toggle button
 * <button onClick={toggleTheme}>
 *   {isDark ? 'Light Mode' : 'Dark Mode'}
 * </button>
 *
 * // Theme selector
 * <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
 *   <option value="light">Light</option>
 *   <option value="dark">Dark</option>
 *   <option value="system">System</option>
 * </select>
 */
export function useDarkMode(): UseDarkModeReturn {
  // Start with system to avoid hydration mismatch
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  // Handle system preference changes and apply dark class
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateDarkMode = () => {
      let shouldBeDark = false;

      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else {
        // system
        shouldBeDark = mediaQuery.matches;
      }

      setIsDark(shouldBeDark);

      // Apply dark class to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateDarkMode();

    // Listen for system preference changes
    mediaQuery.addEventListener('change', updateDarkMode);
    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}

export type { Theme, UseDarkModeReturn };

import { useCallback, useEffect, useState } from 'react';
import type { ThemeName, Theme } from '../types';
import { THEMES, STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem } from '../utils';

interface UseThemeReturn {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(themeName: ThemeName): 'light' | 'dark' {
  if (themeName === 'system') {
    return getSystemTheme();
  }
  return themeName;
}

export function useTheme(defaultTheme: ThemeName = 'system'): UseThemeReturn {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    return getStorageItem<ThemeName>(STORAGE_KEYS.theme, defaultTheme);
  });

  const resolvedThemeName = resolveTheme(themeName);
  const theme = THEMES[resolvedThemeName];

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    setStorageItem(STORAGE_KEYS.theme, name);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedThemeName === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedThemeName, setTheme]);

  useEffect(() => {
    if (themeName !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => {
      // Force re-render when system theme changes
      setThemeName('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeName]);

  useEffect(() => {
    // Apply theme to document root for CSS variables
    document.documentElement.setAttribute('data-theme', resolvedThemeName);
  }, [resolvedThemeName]);

  return {
    theme,
    themeName,
    setTheme,
    toggleTheme,
    isDark: resolvedThemeName === 'dark',
  };
}

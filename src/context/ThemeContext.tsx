import { createContext, useContext, useMemo, type ReactNode, type ReactElement } from 'react';
import type { Theme, ThemeName } from '../types';
import { useTheme } from '../hooks/useTheme';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps): ReactElement {
  const themeState = useTheme(defaultTheme);

  const value = useMemo(
    () => ({
      theme: themeState.theme,
      themeName: themeState.themeName,
      setTheme: themeState.setTheme,
      toggleTheme: themeState.toggleTheme,
      isDark: themeState.isDark,
    }),
    [themeState]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
}

export { ThemeContext };

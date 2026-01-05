import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '../constants';

type BreakpointKey = keyof typeof BREAKPOINTS;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
  return useMediaQuery(query);
}

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

export function useBreakpoints(): BreakpointState {
  const isMobile = !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`) && !useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isLargeDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);

  return { isMobile, isTablet, isDesktop, isLargeDesktop };
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

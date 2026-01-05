// Core application types

export interface AppConfig {
  readonly appName: string;
  readonly version: string;
  readonly environment: Environment;
  readonly features: FeatureFlags;
}

export type Environment = 'development' | 'staging' | 'production';

export interface FeatureFlags {
  readonly enableAnalytics: boolean;
  readonly enableDarkMode: boolean;
  readonly enableNotifications: boolean;
}

// Theme types
export interface Theme {
  readonly name: ThemeName;
  readonly colors: ThemeColors;
  readonly typography: Typography;
  readonly spacing: Spacing;
}

export type ThemeName = 'light' | 'dark' | 'system';

export interface ThemeColors {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly error: string;
  readonly warning: string;
  readonly success: string;
  readonly info: string;
  readonly border: string;
}

export interface Typography {
  readonly fontFamily: string;
  readonly fontFamilyMono: string;
  readonly fontSizeBase: string;
  readonly fontSizeSm: string;
  readonly fontSizeLg: string;
  readonly fontSizeXl: string;
  readonly lineHeight: number;
}

export interface Spacing {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly xxl: string;
}

// API types
export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message: string;
  readonly timestamp: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

// Component prop types
export interface BaseComponentProps {
  readonly className?: string;
  readonly testId?: string;
  readonly children?: React.ReactNode;
}

// Web Vitals types
export interface WebVitalsMetric {
  readonly name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  readonly value: number;
  readonly rating: 'good' | 'needs-improvement' | 'poor';
  readonly delta: number;
  readonly id: string;
  readonly navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender';
}

export type WebVitalsCallback = (metric: WebVitalsMetric) => void;

// Settings types for API key management (future use)
export interface AppSettings {
  readonly apiKeys: ApiKeySettings;
  readonly preferences: UserPreferences;
}

export interface ApiKeySettings {
  readonly [serviceName: string]: string | undefined;
}

export interface UserPreferences {
  readonly theme: ThemeName;
  readonly language: string;
  readonly notifications: boolean;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

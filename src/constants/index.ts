import type { AppConfig, Theme, ThemeColors, Typography, Spacing } from '../types';

// Application configuration
export const APP_CONFIG: AppConfig = {
  appName: 'Vibr',
  version: process.env.REACT_APP_VERSION ?? '0.1.0',
  environment: (process.env.NODE_ENV as AppConfig['environment']) ?? 'development',
  features: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableDarkMode: true,
    enableNotifications: true,
  },
} as const;

// External links
export const EXTERNAL_LINKS = {
  documentation: 'https://reactjs.org',
  github: 'https://github.com',
  support: 'https://support.example.com',
} as const;

// Theme colors
const LIGHT_COLORS: ThemeColors = {
  primary: '#61dafb',
  secondary: '#282c34',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#282c34',
  textSecondary: '#6c757d',
  error: '#dc3545',
  warning: '#ffc107',
  success: '#28a745',
  info: '#17a2b8',
  border: '#dee2e6',
} as const;

const DARK_COLORS: ThemeColors = {
  primary: '#61dafb',
  secondary: '#ffffff',
  background: '#282c34',
  surface: '#3d4451',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  error: '#f56565',
  warning: '#ed8936',
  success: '#48bb78',
  info: '#4299e1',
  border: '#4a5568',
} as const;

const TYPOGRAPHY: Typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontFamilyMono: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  fontSizeBase: '1rem',
  fontSizeSm: '0.875rem',
  fontSizeLg: '1.125rem',
  fontSizeXl: '1.25rem',
  lineHeight: 1.5,
} as const;

const SPACING: Spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
} as const;

export const THEMES: Record<'light' | 'dark', Theme> = {
  light: {
    name: 'light',
    colors: LIGHT_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
  },
  dark: {
    name: 'dark',
    colors: DARK_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
  },
} as const;

// Animation durations (in ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  logoSpin: 20000,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'vibr_theme',
  settings: 'vibr_settings',
  apiKeys: 'vibr_api_keys',
} as const;

// File upload configuration
export const FILE_UPLOAD = {
  maxFileSize: 50 * 1024 * 1024, // 50MB per file
  maxTotalSize: 100 * 1024 * 1024, // 100MB total
  maxFiles: 50,
  // Warning threshold - files larger than this may hit AI token limits
  largeFileWarningSize: 500 * 1024, // 500KB - roughly ~125K tokens
  acceptedTypes: [
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
    '.vue', '.svelte', '.py', '.java', '.go',
    '.rs', '.rb', '.php', '.css', '.scss', '.html',
    '.json', '.yaml', '.yml', '.md', '.txt',
    '.c', '.cpp', '.h', '.hpp', '.cs', '.swift',
    '.kt', '.scala', '.sql', '.sh', '.bash', '.zsh',
    '.xml', '.graphql', '.prisma', '.env.example',
  ],
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  generic: 'An unexpected error occurred. Please try again.',
  network: 'Unable to connect. Please check your internet connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
} as const;

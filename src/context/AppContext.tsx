import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type ReactElement,
  type Dispatch,
} from 'react';
import type { AppConfig, UserPreferences } from '../types';
import { APP_CONFIG } from '../constants';

// State interface
interface AppState {
  config: AppConfig;
  preferences: UserPreferences;
  isInitialized: boolean;
}

// Action types
type AppAction =
  | { type: 'INITIALIZE' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'RESET_PREFERENCES' };

// Initial state
const initialPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: true,
};

const initialState: AppState = {
  config: APP_CONFIG,
  preferences: initialPreferences,
  isInitialized: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isInitialized: true };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case 'RESET_PREFERENCES':
      return { ...state, preferences: initialPreferences };
    default:
      return state;
  }
}

// Context
interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps): ReactElement {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo(() => {
    const updatePreferences = (preferences: Partial<UserPreferences>): void => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    };

    const resetPreferences = (): void => {
      dispatch({ type: 'RESET_PREFERENCES' });
    };

    return {
      state,
      dispatch,
      updatePreferences,
      resetPreferences,
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}

export { AppContext };

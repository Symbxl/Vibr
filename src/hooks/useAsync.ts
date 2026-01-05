import { useCallback, useReducer, useRef } from 'react';
import type { ApiError, AsyncState } from '../types';
import { formatError } from '../utils';

type AsyncAction<T> =
  | { type: 'IDLE' }
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: ApiError };

function asyncReducer<T>(
  _state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> {
  switch (action.type) {
    case 'IDLE':
      return { status: 'idle' };
    case 'LOADING':
      return { status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', data: action.data };
    case 'ERROR':
      return { status: 'error', error: action.error };
    default:
      return _state;
  }
}

interface UseAsyncReturn<T> {
  state: AsyncState<T>;
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: T | undefined;
  error: ApiError | undefined;
}

export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, dispatch] = useReducer(asyncReducer<T>, { status: 'idle' });
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      dispatch({ type: 'LOADING' });

      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          dispatch({ type: 'SUCCESS', data: result });
        }
        return result;
      } catch (error) {
        if (mountedRef.current) {
          dispatch({ type: 'ERROR', error: formatError(error) });
        }
        return undefined;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'IDLE' });
  }, []);

  // Execute immediately if requested
  if (immediate && state.status === 'idle') {
    execute();
  }

  return {
    state,
    execute,
    reset,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    data: state.status === 'success' ? state.data : undefined,
    error: state.status === 'error' ? state.error : undefined,
  };
}

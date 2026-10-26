import { QueryClient, QueryCache, MutationCache, focusManager } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { defaultQueryOptions } from './queryConfig';
import { globalErrorHandler } from './errorHandler';

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

AppState.addEventListener('change', onAppStateChange);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalError) return;
      globalErrorHandler(error, 'query', query);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      if (mutation.options.meta?.skipGlobalError) return;
      globalErrorHandler(error, 'mutation', mutation);
    },
  }),
  defaultOptions: defaultQueryOptions,
});

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { defaultQueryOptions } from './queryConfig';
import { globalErrorHandler } from './errorHandler';

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

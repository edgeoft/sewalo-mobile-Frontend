import { DefaultOptions } from '@tanstack/react-query';

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: 3, // React Query's native retry mechanism
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
};

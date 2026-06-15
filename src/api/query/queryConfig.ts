import { DefaultOptions } from '@tanstack/react-query';

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: false, // Managed by our resilience layer
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
};

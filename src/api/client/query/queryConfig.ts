import { DefaultOptions } from '@tanstack/react-query';

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection cache retention
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  mutations: {
    retry: false,
  },
};

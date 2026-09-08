import { DefaultOptions } from '@tanstack/react-query';

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: (failureCount, error: unknown) => {
      if (failureCount >= 3) return false;
      const status =
        (error as { status?: number; response?: { status?: number } })?.status ||
        (error as { status?: number; response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return true;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection cache retention
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  mutations: {
    retry: false,
  },
};

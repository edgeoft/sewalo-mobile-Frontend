import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCategoriesAction } from './actions';
import type { CategoryResponse } from '@/types';

export const useGetCategoriesQuery = (
  show?: 'all' | 'homepage',
  options?: Omit<UseQueryOptions<CategoryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<CategoryResponse, Error>({
    queryKey: QUERY_KEYS.CATEGORIES.ALL(show),
    queryFn: () => getCategoriesAction(show),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCategoriesQuery = (show?: 'all' | 'homepage') => {
  return useGetCategoriesQuery(show);
};

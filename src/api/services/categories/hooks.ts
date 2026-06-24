import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCategoriesAction } from './actions';
import type { CategoryResponse } from '@/types';

export const useGetCategoriesQuery = (
  show?: 'all' | 'homepage',
  options?: Omit<UseQueryOptions<CategoryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<CategoryResponse, Error>({
    queryKey: ['categories', show],
    queryFn: () => getCategoriesAction(show),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCategoriesQuery = (show?: 'all' | 'homepage') => {
  return useGetCategoriesQuery(show);
};

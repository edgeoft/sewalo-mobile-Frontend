import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCategoryListAction } from '../actions/category';
import { CategoryResponse } from '../types/category';

export const useGetCategoriesQuery = (
  show?: 'all' | 'homepage',
  options?: Omit<UseQueryOptions<CategoryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<CategoryResponse, Error>({
    queryKey: ['category-list', show],
    queryFn: () => getCategoryListAction(show),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

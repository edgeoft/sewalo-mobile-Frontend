import { useQuery } from '@tanstack/react-query';
import { getCategoriesAction } from '../actions/category';
import type { CategoryResponse } from '../types/category';

export const useCategoriesQuery = (show?: 'all' | 'homepage') => {
  return useQuery<CategoryResponse, Error>({
    queryKey: ['categories', show],
    queryFn: () => getCategoriesAction(show),
    retry: false,
  });
};

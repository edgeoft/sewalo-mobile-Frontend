import { createQueryHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCategoriesAction } from './actions';
import type { CategoryResponse } from '@/types';

const categoriesQueryHook = createQueryHook<CategoryResponse, 'all' | 'homepage' | undefined>(
  (show) => QUERY_KEYS.CATEGORIES.ALL(show),
  (show) => getCategoriesAction(show),
);

export const useGetCategoriesQuery = (show?: 'all' | 'homepage') => categoriesQueryHook(show);

export const useCategoriesQuery = (show?: 'all' | 'homepage') => useGetCategoriesQuery(show);

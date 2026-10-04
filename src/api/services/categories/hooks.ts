import { createQueryHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getCategoriesAction, getSubCategoriesAction } from './actions';
import type { CategoryResponse, SubCategoryListResponse } from '@/types';

const categoriesQueryHook = createQueryHook<CategoryResponse, 'all' | 'homepage' | undefined>(
  (show) => QUERY_KEYS.CATEGORIES.ALL(show),
  (show) => getCategoriesAction(show),
);

export const useGetCategoriesQuery = (show?: 'all' | 'homepage') => categoriesQueryHook(show);
export const useCategoriesQuery = (show?: 'all' | 'homepage') => useGetCategoriesQuery(show);

const subCategoriesQueryHook = createQueryHook<SubCategoryListResponse, string>(
  (slug) => QUERY_KEYS.CATEGORIES.SUB(slug),
  (slug) => getSubCategoriesAction(slug),
);

export const useGetSubCategoriesQuery = (slug: string, enabled: boolean = true) =>
  subCategoriesQueryHook(slug, { enabled: enabled && !!slug });

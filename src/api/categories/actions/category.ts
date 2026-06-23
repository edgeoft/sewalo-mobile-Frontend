import { internalClient } from '@/api/clients/internal';
import type { CategoryResponse } from '../types/category';

export const getCategoriesAction = async (show?: 'all' | 'homepage'): Promise<CategoryResponse> => {
  const params = show ? { show } : {};
  return internalClient.get('/categories', { params });
};

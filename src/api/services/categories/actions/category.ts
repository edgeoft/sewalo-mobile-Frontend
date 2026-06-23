import { internalClient } from '@/api/client/instances/internal';
import type { CategoryResponse } from '@/types';

export const getCategoriesAction = async (show?: 'all' | 'homepage'): Promise<CategoryResponse> => {
  const params = show ? { show } : {};
  return internalClient.get('/categories', { params });
};

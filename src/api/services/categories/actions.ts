import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import type { CategoryResponse } from '@/types';

export const getCategoriesAction = async (show?: 'all' | 'homepage'): Promise<CategoryResponse> => {
  const params = show ? { show } : {};
  return internalClient.get(API_ENDPOINTS.CATEGORIES.LIST, { params });
};

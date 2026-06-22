import { internalClient } from '@/api/clients/internal';
import { CategoryResponse } from '../types/category';

export const getCategoryListAction = async (show?: 'all' | 'homepage'): Promise<CategoryResponse> => {
  return internalClient.get<CategoryResponse>('/categories', {
    params: show ? { show } : undefined,
  });
};

import { internalClient } from '@/api/client/instances/internal';
import { CategoryResponse } from '@/types';

export const getCategoryListAction = async (show?: 'all' | 'homepage'): Promise<CategoryResponse> => {
  return internalClient.get<CategoryResponse>('/categories', {
    params: show ? { show } : undefined,
  });
};

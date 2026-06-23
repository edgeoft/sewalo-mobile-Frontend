import { internalClient } from '@/api/client/instances/internal';
import { AddRemoveFavoritePayload, GetFavoritesResponse } from '@/types';

export const getFavoritesAction = async (page: number = 1, limit: number = 10): Promise<GetFavoritesResponse> => {
  return internalClient.get<GetFavoritesResponse>('/favourites', {
    params: {
      page,
      limit,
    },
  });
};

export const addRemoveFavoriteAction = async (data: AddRemoveFavoritePayload): Promise<void> => {
  return internalClient.post<void>('/favourites', data);
};

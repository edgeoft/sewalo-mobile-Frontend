import { useMutation, useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { getFavoritesAction, addRemoveFavoriteAction } from '../actions/favourites';
import { AddRemoveFavoritePayload, GetFavoritesResponse } from '../types/favourites';

export const useGetFavoritesQuery = (
  params: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<GetFavoritesResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  return useQuery<GetFavoritesResponse, Error>({
    queryKey: ['favourites-list', page, limit],
    queryFn: () => getFavoritesAction(page, limit),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useAddRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddRemoveFavoritePayload>({
    mutationFn: addRemoveFavoriteAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites-list'] });
    },
  });
};

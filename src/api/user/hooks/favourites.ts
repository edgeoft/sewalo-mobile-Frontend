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
    onMutate: async ({ service_id }) => {
      await queryClient.cancelQueries({ queryKey: ['service-list'] });
      const previousServices = queryClient.getQueriesData({ queryKey: ['service-list'] });

      queryClient.setQueriesData({ queryKey: ['service-list'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((s: any) => (s.id === service_id ? { ...s, is_favourite: !s.is_favourite } : s)),
        };
      });

      return { previousServices };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousServices) {
        for (const [key, data] of context.previousServices) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites-list'] });
      queryClient.invalidateQueries({ queryKey: ['service-list'] });
      queryClient.invalidateQueries({ queryKey: ['provider-details'] });
    },
  });
};

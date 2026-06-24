import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  getFavoritesAction,
  addRemoveFavoriteAction,
  completeProfileAction,
  changePasswordAction,
  updateProfileAction,
  getProviderDetailsAction,
  getServiceListAction,
} from './actions';
import { getProfileAction } from '../auth/actions';
import {
  AddRemoveFavoritePayload,
  GetFavoritesResponse,
  CompleteProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  GetProfileResponse,
  UpdateProfilePayload,
  ProviderDetailsResponse,
  GetServiceListParams,
  GetServiceListResponse,
} from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

// Favourite Hooks
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
  return useMutation<void, Error, AddRemoveFavoritePayload, { previousServices?: [any, any][] }>({
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

// Onboarding Hooks
export const useCompleteProfile = () => {
  return useMutation<UpdateProfileResponse, Error, CompleteProfilePayload>({
    mutationFn: completeProfileAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
  });
};

// Password Hooks
export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: changePasswordAction,
  });
};

// Profile Hooks
export const useGetProfileQuery = () => {
  return useQuery<GetProfileResponse, Error>({
    queryKey: ['profile'],
    queryFn: getProfileAction,
  });
};

export const useUpdateProfile = () => {
  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: updateProfileAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
  });
};

export const useGetProviderDetailsQuery = (
  id: string,
  options?: Omit<UseQueryOptions<ProviderDetailsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<ProviderDetailsResponse, Error>({
    queryKey: ['provider-details', id],
    queryFn: () => getProviderDetailsAction(id),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Service Hooks
export const useGetServicesQuery = (
  params: GetServiceListParams,
  options?: Omit<UseQueryOptions<GetServiceListResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetServiceListResponse, Error>({
    queryKey: ['service-list', params],
    queryFn: () => getServiceListAction(params),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

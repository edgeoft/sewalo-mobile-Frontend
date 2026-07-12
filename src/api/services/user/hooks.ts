import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  getFavoritesAction,
  addRemoveFavoriteAction,
  completeProfileAction,
  changePasswordAction,
  updateProfileAction,
  getProviderDetailsAction,
  getServiceListAction,
  switchRoleAction,
  switchRoleWithDetailsAction,
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
  SwitchRolePayload,
  SwitchRoleResponse,
  SwitchRoleWithDetailsPayload,
  SwitchRoleWithDetailsResponse,
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
    queryKey: QUERY_KEYS.FAVOURITES_LIST.LIST(page, limit),
    queryFn: () => getFavoritesAction(page, limit),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useAddRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddRemoveFavoritePayload, { previousServices?: [readonly unknown[], unknown][] }>({
    mutationFn: addRemoveFavoriteAction,
    onMutate: async ({ service_id }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SERVICE_LIST.ALL });
      const previousServices = queryClient.getQueriesData({ queryKey: QUERY_KEYS.SERVICE_LIST.ALL });

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.SERVICE_LIST.ALL },
        (old: GetServiceListResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((s) => (s.id === service_id ? { ...s, is_favourite: !s.is_favourite } : s)),
          };
        },
      );

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAVOURITES_LIST.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICE_LIST.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROVIDER_DETAILS.ALL });
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
    queryKey: QUERY_KEYS.PROFILE,
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
    queryKey: QUERY_KEYS.PROVIDER_DETAILS.DETAIL(id),
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
    queryKey: QUERY_KEYS.SERVICE_LIST.LIST(params),
    queryFn: () => getServiceListAction(params),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Role Switching Hooks
export const useSwitchRole = () => {
  const queryClient = useQueryClient();
  return useMutation<SwitchRoleResponse, Error, SwitchRolePayload>({
    mutationFn: switchRoleAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
      queryClient.invalidateQueries();
    },
  });
};

export const useSwitchRoleWithDetails = () => {
  const queryClient = useQueryClient();
  return useMutation<SwitchRoleWithDetailsResponse, Error, SwitchRoleWithDetailsPayload>({
    mutationFn: switchRoleWithDetailsAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
      queryClient.invalidateQueries();
    },
  });
};

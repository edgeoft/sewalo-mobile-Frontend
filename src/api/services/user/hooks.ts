import { createQueryHook, createMutationHook } from '@/api/client/query/factory';
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
  getNearbyProvidersAction,
} from './actions';
import { getProfileAction } from '../auth/actions';
import type {
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
  GetNearbyProvidersParams,
  GetNearbyProvidersResponse,
} from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useQueryClient, useMutation } from '@tanstack/react-query';

// Favourite Hooks
const favoritesQueryHook = createQueryHook<GetFavoritesResponse, { page?: number; limit?: number } | undefined>(
  (params) => QUERY_KEYS.FAVOURITES_LIST.LIST(params?.page || 1, params?.limit || 10),
  (params) => getFavoritesAction(params?.page || 1, params?.limit || 10),
);

export const useGetFavoritesQuery = (params: { page?: number; limit?: number } = {}) => favoritesQueryHook(params);

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

// Profile Hooks
export const useCompleteProfile = createMutationHook<UpdateProfileResponse, CompleteProfilePayload>(
  completeProfileAction,
  {
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
    invalidateKeys: () => [QUERY_KEYS.PROFILE],
  },
);

export const useChangePassword = createMutationHook<ChangePasswordResponse, ChangePasswordPayload>(
  changePasswordAction,
);

export const useGetProfileQuery = createQueryHook<GetProfileResponse, void>(() => QUERY_KEYS.PROFILE, getProfileAction);

export const useUpdateProfile = createMutationHook<UpdateProfileResponse, UpdateProfilePayload>(updateProfileAction, {
  onSuccess: (response) => {
    useAuthStore.getState().updateUser(response.user);
  },
  invalidateKeys: () => [QUERY_KEYS.PROFILE],
});

const providerDetailsQueryHook = createQueryHook<ProviderDetailsResponse, string>(
  (id) => QUERY_KEYS.PROVIDER_DETAILS.DETAIL(id),
  (id) => getProviderDetailsAction(id),
);

export const useGetProviderDetailsQuery = (id: string, options?: { enabled?: boolean }) =>
  providerDetailsQueryHook(id, { enabled: (options?.enabled ?? true) && !!id });

// Service Hooks
const servicesQueryHook = createQueryHook<GetServiceListResponse, GetServiceListParams>(
  (params) => QUERY_KEYS.SERVICE_LIST.LIST(params),
  (params) => getServiceListAction(params),
);

export const useGetServicesQuery = (params: GetServiceListParams) => servicesQueryHook(params);

// Nearby Providers Hooks
const nearbyProvidersQueryHook = createQueryHook<GetNearbyProvidersResponse, GetNearbyProvidersParams>(
  (params) => QUERY_KEYS.PROVIDERS_NEARBY.LIST(params),
  (params) => getNearbyProvidersAction(params),
);

export const useGetNearbyProvidersQuery = (params: GetNearbyProvidersParams) => nearbyProvidersQueryHook(params);

// Role Switching Hooks (S6 fix: scoped query invalidations)
const roleSwitchInvalidations = () => [QUERY_KEYS.PROFILE, QUERY_KEYS.BOOKINGS.BASE, QUERY_KEYS.SERVICE_LIST.ALL];

export const useSwitchRole = createMutationHook<SwitchRoleResponse, SwitchRolePayload>(switchRoleAction, {
  onSuccess: (response) => {
    useAuthStore.getState().updateUser(response.user);
  },
  invalidateKeys: roleSwitchInvalidations,
});

export const useSwitchRoleWithDetails = createMutationHook<SwitchRoleWithDetailsResponse, SwitchRoleWithDetailsPayload>(
  switchRoleWithDetailsAction,
  {
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
    invalidateKeys: roleSwitchInvalidations,
  },
);

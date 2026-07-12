import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import {
  AddRemoveFavoritePayload,
  GetFavoritesResponse,
  CompleteProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
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

// Favourite Actions
export const getFavoritesAction = async (page: number = 1, limit: number = 10): Promise<GetFavoritesResponse> => {
  return internalClient.get<GetFavoritesResponse>(API_ENDPOINTS.FAVOURITES.LIST, {
    params: {
      page,
      limit,
    },
  });
};

export const addRemoveFavoriteAction = async (data: AddRemoveFavoritePayload): Promise<void> => {
  return internalClient.post<void>(API_ENDPOINTS.FAVOURITES.TOGGLE, data);
};

// Onboarding Actions
export const completeProfileAction = async (data: CompleteProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.post<UpdateProfileResponse>(API_ENDPOINTS.USER.COMPLETE_PROFILE, data);
};

// Password Actions
export const changePasswordAction = async (data: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  return internalClient.post<ChangePasswordResponse>(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
};

// Profile Actions
export const updateProfileAction = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.put<UpdateProfileResponse>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
};

export const getProviderDetailsAction = async (id: string): Promise<ProviderDetailsResponse> => {
  return internalClient.get<ProviderDetailsResponse>(API_ENDPOINTS.PROVIDER.DETAILS(id));
};

// Service Actions
export const getServiceListAction = async (params: GetServiceListParams): Promise<GetServiceListResponse> => {
  return internalClient.get<GetServiceListResponse>(API_ENDPOINTS.SERVICES.LIST, {
    params: {
      page: params.page || 1,
      limit: params.limit || 15,
      ...params,
    },
  });
};

// Nearby Providers Action
export const getNearbyProvidersAction = async (
  params: GetNearbyProvidersParams,
): Promise<GetNearbyProvidersResponse> => {
  return internalClient.get<GetNearbyProvidersResponse>(API_ENDPOINTS.PROVIDER.NEARBY, {
    params,
  });
};

// Role Switching Actions
export const switchRoleAction = async (data: SwitchRolePayload): Promise<SwitchRoleResponse> => {
  // ponytail: Keep roles strictly restricted to customer & provider
  if (data.target_role !== 'customer' && data.target_role !== 'provider') {
    throw new Error('Invalid target role. Only customer and provider roles are allowed.');
  }
  return internalClient.post<SwitchRoleResponse>(API_ENDPOINTS.USER.SWITCH_ROLE, data);
};

export const switchRoleWithDetailsAction = async (
  data: SwitchRoleWithDetailsPayload,
): Promise<SwitchRoleWithDetailsResponse> => {
  // ponytail: Keep roles strictly restricted to provider for detail changes
  if (data.target_role !== 'provider') {
    throw new Error('Invalid target role. Only switching to provider is allowed with details.');
  }
  return internalClient.post<SwitchRoleWithDetailsResponse>(API_ENDPOINTS.USER.SWITCH_ROLE_WITH_DETAILS, data);
};

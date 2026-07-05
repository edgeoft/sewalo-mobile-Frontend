import { internalClient } from '@/api/client/instances/internal';
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
} from '@/types';

// Favourite Actions
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

// Onboarding Actions
export const completeProfileAction = async (data: CompleteProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.post<UpdateProfileResponse>('/user/complete', data);
};

// Password Actions
export const changePasswordAction = async (data: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  return internalClient.post<ChangePasswordResponse>('/user/change-password', data);
};

// Profile Actions
export const updateProfileAction = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.put<UpdateProfileResponse>('/user', data);
};

export const getProviderDetailsAction = async (id: string): Promise<ProviderDetailsResponse> => {
  return internalClient.get<ProviderDetailsResponse>(`/user/providers/${id}`);
};

// Service Actions
export const getServiceListAction = async (params: GetServiceListParams): Promise<GetServiceListResponse> => {
  return internalClient.get<GetServiceListResponse>('/services', {
    params: {
      page: params.page || 1,
      limit: params.limit || 15,
      ...params,
    },
  });
};

// Role Switching Actions
export const switchRoleAction = async (data: SwitchRolePayload): Promise<SwitchRoleResponse> => {
  // ponytail: Keep roles strictly restricted to customer & provider
  if (data.target_role !== 'customer' && data.target_role !== 'provider') {
    throw new Error('Invalid target role. Only customer and provider roles are allowed.');
  }
  return internalClient.post<SwitchRoleResponse>('/user/switch-role', data);
};

export const switchRoleWithDetailsAction = async (
  data: SwitchRoleWithDetailsPayload,
): Promise<SwitchRoleWithDetailsResponse> => {
  // ponytail: Keep roles strictly restricted to provider for detail changes
  if (data.target_role !== 'provider') {
    throw new Error('Invalid target role. Only switching to provider is allowed with details.');
  }
  return internalClient.post<SwitchRoleWithDetailsResponse>('/user/switch-role-with-details', data);
};

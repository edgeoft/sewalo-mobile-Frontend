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

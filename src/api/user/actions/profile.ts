import { internalClient } from '@/api/clients/internal';
import { UpdateProfilePayload, UpdateProfileResponse, ProviderDetailsResponse } from '../types/profile';

// Progressive step profile update
export const updateProfileAction = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.put<UpdateProfileResponse>('/user', data);
};

export const getProviderDetailsAction = async (id: string): Promise<ProviderDetailsResponse> => {
  return internalClient.get<ProviderDetailsResponse>(`/user/providers/${id}`);
};

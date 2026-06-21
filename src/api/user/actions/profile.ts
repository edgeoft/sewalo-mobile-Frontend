import { internalClient } from '@/api/clients/internal';
import { UpdateProfilePayload, UpdateProfileResponse } from '../types/profile';

// Progressive step profile update
export const updateProfileAction = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.put<UpdateProfileResponse>('/user', data);
};

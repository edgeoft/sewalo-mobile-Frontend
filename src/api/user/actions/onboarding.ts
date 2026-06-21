import { internalClient } from '@/api/clients/internal';
import { CompleteProfilePayload } from '../types/onboarding';
import { UpdateProfileResponse } from '../types/profile';

// Complete onboarding profile setup
export const completeProfileAction = async (data: CompleteProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.post<UpdateProfileResponse>('/user/complete', data);
};

import { internalClient } from '@/api/client/instances/internal';
import { CompleteProfilePayload, UpdateProfileResponse } from '@/types';

// Complete onboarding profile setup
export const completeProfileAction = async (data: CompleteProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.post<UpdateProfileResponse>('/user/complete', data);
};

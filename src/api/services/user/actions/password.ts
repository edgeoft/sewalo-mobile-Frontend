import { internalClient } from '@/api/client/instances/internal';
import { ChangePasswordPayload, ChangePasswordResponse } from '@/types';

export const changePasswordAction = async (data: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  return internalClient.post<ChangePasswordResponse>('/user/change-password', data);
};

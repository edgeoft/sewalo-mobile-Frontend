import { internalClient } from '@/api/clients/internal';
import { ChangePasswordPayload, ChangePasswordResponse } from '../types/password';

export const changePasswordAction = async (data: ChangePasswordPayload): Promise<ChangePasswordResponse> => {
  return internalClient.post<ChangePasswordResponse>('/user/change-password', data);
};

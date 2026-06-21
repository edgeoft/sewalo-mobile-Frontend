import { useMutation } from '@tanstack/react-query';

import { changePasswordAction } from '../actions/password';
import { ChangePasswordPayload, ChangePasswordResponse } from '../types/password';

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: changePasswordAction,
  });
};

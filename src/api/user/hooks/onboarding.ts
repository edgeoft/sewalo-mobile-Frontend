import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/store/useAuthStore';

import { completeProfileAction } from '../actions/onboarding';
import { CompleteProfilePayload } from '../types/onboarding';
import { UpdateProfileResponse } from '../types/profile';

// Mutation to complete setup
export const useCompleteProfile = () => {
  return useMutation<UpdateProfileResponse, Error, CompleteProfilePayload>({
    mutationFn: completeProfileAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
  });
};

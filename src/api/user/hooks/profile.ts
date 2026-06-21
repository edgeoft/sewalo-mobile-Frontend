import { useMutation, useQuery } from '@tanstack/react-query';

import { getProfileAction } from '@/features/auth/api/actions';
import { GetProfileResponse } from '@/features/auth/api/types';
import { useAuthStore } from '@/store/useAuthStore';

import { updateProfileAction } from '../actions/profile';
import { UpdateProfilePayload, UpdateProfileResponse } from '../types/profile';

// Query to retrieve user profile
export const useGetProfileQuery = () => {
  return useQuery<GetProfileResponse, Error>({
    queryKey: ['profile'],
    queryFn: getProfileAction,
  });
};

// Mutation to progressively save user profile step updates
export const useUpdateProfile = () => {
  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: updateProfileAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
  });
};

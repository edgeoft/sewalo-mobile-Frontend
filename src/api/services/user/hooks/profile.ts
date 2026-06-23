import { getProfileAction } from '@/features/auth/api/actions';
import { GetProfileResponse, UpdateProfilePayload, UpdateProfileResponse, ProviderDetailsResponse } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, UseQueryOptions, useMutation } from '@tanstack/react-query';

import { updateProfileAction, getProviderDetailsAction } from '../actions/profile';

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

export const useGetProviderDetailsQuery = (
  id: string,
  options?: Omit<UseQueryOptions<ProviderDetailsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<ProviderDetailsResponse, Error>({
    queryKey: ['provider-details', id],
    queryFn: () => getProviderDetailsAction(id),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

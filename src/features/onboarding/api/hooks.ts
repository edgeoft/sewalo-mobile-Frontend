import { useMutation, useQuery } from '@tanstack/react-query';

import { getProfileAction } from '@/features/auth/api/actions';
import { GetProfileResponse } from '@/features/auth/api/types';
import { useAuthStore } from '@/store/useAuthStore';

import {
  updateProfileAction,
  completeProfileAction,
  createFinanceAccountAction,
  getFinanceAccountsAction,
} from './actions';
import {
  UpdateProfilePayload,
  UpdateProfileResponse,
  CompleteProfilePayload,
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
} from './types';

// Query to retrieve user profile
export const useGetProfileQuery = () => {
  return useQuery<GetProfileResponse, Error>({
    queryKey: ['profile'],
    queryFn: getProfileAction,
  });
};

// Query to retrieve user bank accounts
export const useGetFinanceAccountsQuery = (enabled: boolean = true) => {
  return useQuery<GetFinanceAccountsResponse, Error>({
    queryKey: ['financeAccounts'],
    queryFn: getFinanceAccountsAction,
    enabled,
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

// Mutation to complete setup
export const useCompleteProfile = () => {
  return useMutation<UpdateProfileResponse, Error, CompleteProfilePayload>({
    mutationFn: completeProfileAction,
    onSuccess: (response) => {
      useAuthStore.getState().updateUser(response.user);
    },
  });
};

// Mutation to create bank payout accounts
export const useCreateFinanceAccount = () => {
  return useMutation<FinanceAccount, Error, CreateFinanceAccountPayload>({
    mutationFn: createFinanceAccountAction,
  });
};

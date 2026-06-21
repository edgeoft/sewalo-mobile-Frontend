import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createFinanceAccountAction,
  deleteFinanceAccountAction,
  getFinanceAccountsAction,
  updateFinanceAccountAction,
} from './actions';
import {
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
  UpdateFinanceAccountPayload,
} from '../types/finance';

// Query to retrieve user bank accounts
export const useGetFinanceAccountsQuery = (enabled: boolean = true) => {
  return useQuery<GetFinanceAccountsResponse, Error>({
    queryKey: ['financeAccounts'],
    queryFn: getFinanceAccountsAction,
    enabled,
  });
};

// Mutation to create bank payout accounts
export const useCreateFinanceAccount = () => {
  return useMutation<FinanceAccount, Error, CreateFinanceAccountPayload>({
    mutationFn: createFinanceAccountAction,
  });
};

export const useUpdateFinanceAccount = () => {
  return useMutation<FinanceAccount, Error, UpdateFinanceAccountPayload>({
    mutationFn: updateFinanceAccountAction,
  });
};

export const useDeleteFinanceAccount = () => {
  return useMutation<void, Error, number>({
    mutationFn: deleteFinanceAccountAction,
  });
};

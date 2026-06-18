import { internalClient } from '@/api';
import {
  UpdateProfilePayload,
  UpdateProfileResponse,
  CompleteProfilePayload,
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
} from './types';

// Progressive step profile update
export const updateProfileAction = async (data: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.put<UpdateProfileResponse>('/user', data);
};

// Complete onboarding profile setup
export const completeProfileAction = async (data: CompleteProfilePayload): Promise<UpdateProfileResponse> => {
  return internalClient.post<UpdateProfileResponse>('/user/complete', data);
};

// Create finance payout account
export const createFinanceAccountAction = async (data: CreateFinanceAccountPayload): Promise<FinanceAccount> => {
  return internalClient.post<FinanceAccount>('/finance-accounts', data);
};

// Retrieve finance accounts
export const getFinanceAccountsAction = async (): Promise<GetFinanceAccountsResponse> => {
  return internalClient.get<GetFinanceAccountsResponse>('/finance-accounts');
};

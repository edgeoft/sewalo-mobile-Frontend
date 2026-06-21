import { internalClient } from '@/api';
import {
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
  UpdateFinanceAccountPayload,
} from '../types/finance';

export const getFinanceAccountsAction = async (): Promise<GetFinanceAccountsResponse> => {
  return internalClient.get<GetFinanceAccountsResponse>('/finance-accounts');
};

export const createFinanceAccountAction = async (data: CreateFinanceAccountPayload): Promise<FinanceAccount> => {
  return internalClient.post<FinanceAccount>('/finance-accounts', data);
};

export const updateFinanceAccountAction = async (data: UpdateFinanceAccountPayload): Promise<FinanceAccount> => {
  const { id, ...body } = data;
  return internalClient.put<FinanceAccount>(`/finance-accounts/${id}`, body);
};

export const deleteFinanceAccountAction = async (id: number): Promise<void> => {
  return internalClient.delete<void>(`/finance-accounts/${id}`);
};

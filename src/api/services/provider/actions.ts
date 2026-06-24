import { internalClient } from '@/api/client/instances/internal';
import {
  GetCommissionsParams,
  GetCommissionsResponse,
  GetCommissionSummaryResponse,
  ProviderDashboardResponse,
  GetEarningSummaryResponse,
  GetMyTransactionsParams,
  GetMyTransactionsResponse,
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
  UpdateFinanceAccountPayload,
  CategoryListResponse,
  SubCategoryListResponse,
  GetMyServicesResponse,
  CreateServiceParams,
  Service,
  UpdateServiceParams,
} from '@/types';

// Commissions
export const getCommissionSummaryAction = async (): Promise<GetCommissionSummaryResponse> => {
  return internalClient.get<GetCommissionSummaryResponse>('/commissions/summary');
};

export const getCommissionsAction = async (params: GetCommissionsParams): Promise<GetCommissionsResponse> => {
  return internalClient.get<GetCommissionsResponse>('/commissions', {
    params,
  });
};

// Dashboard
export const getProviderDashboardStatsAction = async (): Promise<ProviderDashboardResponse> => {
  return internalClient.get<ProviderDashboardResponse>('/provider/dashboard/stats');
};

// Earnings
export const getEarningSummaryAction = async (): Promise<GetEarningSummaryResponse> => {
  return internalClient.get<GetEarningSummaryResponse>('/transactions/earnings/summary');
};

export const getMyTransactionsAction = async ({
  page = 1,
  limit = 10,
}: GetMyTransactionsParams): Promise<GetMyTransactionsResponse> => {
  return internalClient.get<GetMyTransactionsResponse>('/transactions', {
    params: {
      page,
      limit,
    },
  });
};

// Finance Accounts
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

// Services
export const getProviderCategoriesAction = async (): Promise<CategoryListResponse> => {
  return internalClient.get<CategoryListResponse>('/categories');
};

export const getProviderSubCategoriesAction = async (slug: string): Promise<SubCategoryListResponse> => {
  return internalClient.get<SubCategoryListResponse>(`/categories/${slug}/sub-categories`);
};

export const getMyServicesAction = async (): Promise<GetMyServicesResponse> => {
  return internalClient.get<GetMyServicesResponse>('/services/my-services');
};

export const createServiceAction = async (payload: CreateServiceParams): Promise<Service> => {
  return internalClient.post<Service>('/services', payload);
};

export const updateServiceAction = async (payload: UpdateServiceParams): Promise<Service> => {
  const { id, ...rest } = payload;
  return internalClient.put<Service>(`/services/${id}`, rest);
};

export const deleteServiceAction = async (id: string): Promise<void> => {
  return internalClient.delete<void>(`/services/${id}`);
};

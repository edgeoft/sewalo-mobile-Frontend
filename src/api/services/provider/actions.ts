import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import {
  CommissionSummary,
  GetCommissionsParams,
  GetCommissionsResponse,
  ProviderDashboardResponse,
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
export const getCommissionSummaryAction = async (): Promise<CommissionSummary> => {
  return internalClient.get<CommissionSummary>(API_ENDPOINTS.COMMISSIONS.SUMMARY);
};

export const getCommissionsAction = async (params: GetCommissionsParams): Promise<GetCommissionsResponse> => {
  return internalClient.get<GetCommissionsResponse>(API_ENDPOINTS.COMMISSIONS.LIST, {
    params,
  });
};

// Dashboard
export const getProviderDashboardStatsAction = async (): Promise<ProviderDashboardResponse> => {
  return internalClient.get<ProviderDashboardResponse>(API_ENDPOINTS.PROVIDER.DASHBOARD_STATS);
};

// Finance Accounts
export const getFinanceAccountsAction = async (): Promise<GetFinanceAccountsResponse> => {
  return internalClient.get<GetFinanceAccountsResponse>(API_ENDPOINTS.FINANCE_ACCOUNTS.LIST);
};

export const createFinanceAccountAction = async (data: CreateFinanceAccountPayload): Promise<FinanceAccount> => {
  return internalClient.post<FinanceAccount>(API_ENDPOINTS.FINANCE_ACCOUNTS.CREATE, data);
};

export const updateFinanceAccountAction = async (data: UpdateFinanceAccountPayload): Promise<FinanceAccount> => {
  const { id, ...body } = data;
  return internalClient.put<FinanceAccount>(API_ENDPOINTS.FINANCE_ACCOUNTS.UPDATE(id), body);
};

export const deleteFinanceAccountAction = async (id: number): Promise<void> => {
  return internalClient.delete<void>(API_ENDPOINTS.FINANCE_ACCOUNTS.DELETE(id));
};

// Services
export const getProviderCategoriesAction = async (): Promise<CategoryListResponse> => {
  return internalClient.get<CategoryListResponse>(API_ENDPOINTS.CATEGORIES.LIST);
};

export const getProviderSubCategoriesAction = async (slug: string): Promise<SubCategoryListResponse> => {
  return internalClient.get<SubCategoryListResponse>(API_ENDPOINTS.CATEGORIES.SUB_CATEGORIES(slug));
};

export const getMyServicesAction = async (): Promise<GetMyServicesResponse> => {
  return internalClient.get<GetMyServicesResponse>(API_ENDPOINTS.SERVICES.MY_SERVICES);
};

export const createServiceAction = async (payload: CreateServiceParams): Promise<Service> => {
  return internalClient.post<Service>(API_ENDPOINTS.SERVICES.CREATE, payload);
};

export const updateServiceAction = async (payload: UpdateServiceParams): Promise<Service> => {
  const { id, ...rest } = payload;
  return internalClient.put<Service>(API_ENDPOINTS.SERVICES.UPDATE(id), rest);
};

export const deleteServiceAction = async (id: string): Promise<void> => {
  return internalClient.delete<void>(API_ENDPOINTS.SERVICES.DELETE(id));
};

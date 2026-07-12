import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  getCommissionSummaryAction,
  getCommissionsAction,
  getProviderDashboardStatsAction,
  getEarningSummaryAction,
  getMyTransactionsAction,
  createFinanceAccountAction,
  deleteFinanceAccountAction,
  getFinanceAccountsAction,
  updateFinanceAccountAction,
  getProviderCategoriesAction,
  getProviderSubCategoriesAction,
  getMyServicesAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from './actions';
import {
  GetCommissionsParams,
  GetCommissionsResponse,
  GetCommissionSummaryResponse,
  ProviderDashboardResponse,
  GetEarningSummaryResponse,
  GetMyTransactionsResponse,
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
  UpdateFinanceAccountPayload,
  CreateServiceParams,
  UpdateServiceParams,
  Service,
  CategoryListResponse,
  SubCategoryListResponse,
  GetMyServicesResponse,
} from '@/types';

// Commissions
export const useCommissionSummaryQuery = (
  options?: Omit<UseQueryOptions<GetCommissionSummaryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetCommissionSummaryResponse, Error>({
    queryKey: QUERY_KEYS.COMMISSION_SUMMARY,
    queryFn: getCommissionSummaryAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCommissionsQuery = (
  params: GetCommissionsParams,
  options?: Omit<UseQueryOptions<GetCommissionsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetCommissionsResponse, Error>({
    queryKey: QUERY_KEYS.COMMISSIONS(params),
    queryFn: () => getCommissionsAction(params),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Dashboard
export const useProviderDashboardQuery = (
  options?: Omit<UseQueryOptions<ProviderDashboardResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<ProviderDashboardResponse, Error>({
    queryKey: QUERY_KEYS.PROVIDER_DASHBOARD_STATS,
    queryFn: getProviderDashboardStatsAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Earnings
export const useEarningSummaryQuery = (
  options?: Omit<UseQueryOptions<GetEarningSummaryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetEarningSummaryResponse, Error>({
    queryKey: QUERY_KEYS.EARNING_SUMMARY,
    queryFn: getEarningSummaryAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useMyTransactionsQuery = (
  params: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<GetMyTransactionsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  return useQuery<GetMyTransactionsResponse, Error>({
    queryKey: QUERY_KEYS.MY_TRANSACTIONS(page, limit),
    queryFn: () => getMyTransactionsAction({ page, limit }),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Finance Accounts
export const useGetFinanceAccountsQuery = (enabled: boolean = true) => {
  return useQuery<GetFinanceAccountsResponse, Error>({
    queryKey: QUERY_KEYS.FINANCE_ACCOUNTS,
    queryFn: getFinanceAccountsAction,
    enabled,
  });
};

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

// Services
export const useGetProviderCategoriesQuery = () => {
  return useQuery<CategoryListResponse, Error>({
    queryKey: QUERY_KEYS.PROVIDER_CATEGORIES,
    queryFn: getProviderCategoriesAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetProviderSubCategoriesQuery = (slug: string, enabled: boolean = true) => {
  return useQuery<SubCategoryListResponse, Error>({
    queryKey: QUERY_KEYS.PROVIDER_SUBCATEGORIES(slug),
    queryFn: () => getProviderSubCategoriesAction(slug),
    enabled: enabled && !!slug,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetMyServicesQuery = (options: { enabled?: boolean } = {}) => {
  return useQuery<GetMyServicesResponse, Error>({
    queryKey: QUERY_KEYS.MY_SERVICES,
    queryFn: getMyServicesAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, CreateServiceParams>({
    mutationFn: createServiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_SERVICES });
    },
  });
};

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteServiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_SERVICES });
    },
  });
};

export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, UpdateServiceParams>({
    mutationFn: updateServiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_SERVICES });
    },
  });
};

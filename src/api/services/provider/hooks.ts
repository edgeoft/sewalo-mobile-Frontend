import { createQueryHook, createMutationHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  getCommissionSummaryAction,
  getCommissionsAction,
  getProviderDashboardStatsAction,
  createFinanceAccountAction,
  deleteFinanceAccountAction,
  getFinanceAccountsAction,
  updateFinanceAccountAction,
  getMyServicesAction,
  createServiceAction,
  updateServiceAction,
} from './actions';
import type {
  GetCommissionsParams,
  GetCommissionsResponse,
  CommissionSummary,
  ProviderDashboardResponse,
  CreateFinanceAccountPayload,
  FinanceAccount,
  GetFinanceAccountsResponse,
  UpdateFinanceAccountPayload,
  CreateServiceParams,
  UpdateServiceParams,
  Service,
  GetMyServicesResponse,
} from '@/types';

// Commissions
export const useCommissionSummaryQuery = createQueryHook<CommissionSummary, void>(
  () => QUERY_KEYS.COMMISSION_SUMMARY,
  getCommissionSummaryAction,
);

const commissionsQueryHook = createQueryHook<GetCommissionsResponse, GetCommissionsParams>(
  (params) => QUERY_KEYS.COMMISSIONS(params),
  (params) => getCommissionsAction(params),
);

export const useCommissionsQuery = (params: GetCommissionsParams) => commissionsQueryHook(params);

// Dashboard
export const useProviderDashboardQuery = createQueryHook<ProviderDashboardResponse, void>(
  () => QUERY_KEYS.PROVIDER_DASHBOARD_STATS,
  getProviderDashboardStatsAction,
);

// Finance Accounts
const financeAccountsQueryHook = createQueryHook<GetFinanceAccountsResponse, void>(
  () => QUERY_KEYS.FINANCE_ACCOUNTS,
  getFinanceAccountsAction,
);

export const useGetFinanceAccountsQuery = (enabled: boolean = true) => financeAccountsQueryHook(undefined, { enabled });

const financeInvalidationKeys = () => [QUERY_KEYS.FINANCE_ACCOUNTS];

export const useCreateFinanceAccount = createMutationHook<FinanceAccount, CreateFinanceAccountPayload>(
  createFinanceAccountAction,
  { invalidateKeys: financeInvalidationKeys },
);

export const useUpdateFinanceAccount = createMutationHook<FinanceAccount, UpdateFinanceAccountPayload>(
  updateFinanceAccountAction,
  { invalidateKeys: financeInvalidationKeys },
);

export const useDeleteFinanceAccount = createMutationHook<void, number>(deleteFinanceAccountAction, {
  invalidateKeys: financeInvalidationKeys,
});

// Services
export {
  useGetCategoriesQuery as useGetProviderCategoriesQuery,
  useGetSubCategoriesQuery as useGetProviderSubCategoriesQuery,
} from '@/api/services/categories/hooks';

const myServicesQueryHook = createQueryHook<GetMyServicesResponse, void>(
  () => QUERY_KEYS.MY_SERVICES,
  getMyServicesAction,
);

export const useGetMyServicesQuery = (options: { enabled?: boolean } = {}) => myServicesQueryHook(undefined, options);

const myServicesInvalidationKeys = () => [QUERY_KEYS.MY_SERVICES];

export const useCreateServiceMutation = createMutationHook<Service, CreateServiceParams>(createServiceAction, {
  invalidateKeys: myServicesInvalidationKeys,
});

export const useUpdateServiceMutation = createMutationHook<Service, UpdateServiceParams>(updateServiceAction, {
  invalidateKeys: myServicesInvalidationKeys,
});

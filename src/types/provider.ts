import { UserProfile, DeliveryType } from '@/types';
import { PaginatedResponse } from './common';
import type { ProviderBookingItem } from '@/features/provider/constants/providerBookings';

// Earnings Types
export type TransactionType = 'credit' | 'debit';
export type TransactionMethod = 'esewa' | 'cash';

export interface TransactionBooking {
  id: string;
  user_id: string;
  service_id: string;
  provider_id: string;
  service_date: string;
  start_time: string;
  status: string;
  address: string;
  city: string;
  state: string;
  country: string;
  user: UserProfile;
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string | null;
  };
}

export interface Transaction {
  id: string;
  booking_id: string;
  provider_id: string;
  type: TransactionType;
  method: TransactionMethod;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: string;
  commission_status: string;
  description: string;
  notes: string;
  processed_at: string;
  created_at: string;
  updated_at: string;
  booking?: TransactionBooking;
  provider?: UserProfile;
}

export interface GetEarningSummaryResponse {
  provider: UserProfile;
  earnings: {
    total_earnings: number;
    pending_commission: number;
    pending_payouts: number;
    total_commission_paid: number;
    total_payouts_received: number;
  };
  statistics: {
    total_transactions: number;
    completed_transactions: number;
    pending_commission_amount: number;
    pending_payouts_amount: number;
  };
}

export interface GetMyTransactionsParams {
  limit: number;
  page: number;
}

export type GetMyTransactionsResponse = PaginatedResponse<Transaction>;

// Commission Types
export enum COMMISSION_TYPE {
  MY_EARNINGS = 'owned',
  COMMISSION_DUE = 'payable_to_admin',
}

export enum EARNINGS_FILTER_STATUS {
  ALL = 'all',
  PAID = 'paid',
  UNPAID = 'unpaid',
}

export interface Commission {
  id: string;
  provider_id: string;
  booking_id: string;
  amount: number;
  total_earned_after_commission: number;
  type: COMMISSION_TYPE;
  has_paid: boolean;
  created_at: string;
  updated_at: string;
  provider?: UserProfile;
  booking?: TransactionBooking;
}

export interface CommissionSummary {
  total_amount_earned_after_commission: number;
  total_commission_pending_dispatch_by_admin: number;
  total_commission_to_be_paid: number;
}

export interface GetCommissionsParams {
  page?: number;
  limit?: number;
  type?: COMMISSION_TYPE;
  has_paid?: boolean;
}

export type GetCommissionsResponse = PaginatedResponse<Commission>;

export type GetCommissionSummaryResponse = CommissionSummary;

// Finance Types
export enum FinanceAccountType {
  BANK = 'bank',
  DIGITAL_WALLET = 'wallet',
}

export interface FinanceAccount {
  id: number;
  user_id: string;
  name: string;
  account_holder_name: string;
  account_no: string;
  type: FinanceAccountType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFinanceAccountPayload {
  name: string;
  account_holder_name: string;
  account_no: string;
  type: FinanceAccountType;
  is_default?: boolean;
}

export interface UpdateFinanceAccountPayload extends Partial<CreateFinanceAccountPayload> {
  id: number;
}

export interface GetFinanceAccountsResponse {
  current_page: number;
  data: FinanceAccount[];
  total: number;
}

// Service Form Data Type (used by schemas and UI)
export interface ServiceFormData {
  title: string;
  categoryId: string;
  serviceTypeIds: string[];
  description: string;
  rates: Record<
    string,
    {
      price: string;
      billingBasis: 'per_hour' | 'per_day' | 'per_job' | 'per_project' | 'per_session';
      duration: string;
      durationUnit: 'minutes' | 'hours' | 'days' | 'weeks';
    }
  >;
  deliveryTypes: DeliveryType[];
  workSamples: { uri: string; uploaded: boolean }[];
  hashtags: string[];
  portfolioUrl: string;
  packages?: {
    id?: string;
    title: string;
    description: string;
    price: string;
  }[];
}

// Financial details form types
export type FinanceAccountFormValues = {
  type: FinanceAccountType;
  name: string;
  account_holder_name: string;
  account_no: string;
  is_default?: boolean;
};

export type FinancialData = FinanceAccountFormValues;

export interface ProviderDashboardResponse {
  stats: {
    pendingOrders: number;
    completedOrders: number;
    avgRating: number;
    completionRate: string;
  };
  metrics: {
    totalEarnings: string;
    profileViews: string;
    acceptanceRate: string;
    acceptanceRating: string;
  };
  recentBookings: ProviderBookingItem[];
}

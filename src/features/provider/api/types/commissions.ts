import { UserProfile } from '@/features/auth/api/types';
import { TransactionBooking } from './earnings';

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

export interface GetCommissionsResponse {
  current_page: number;
  data: Commission[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
  total: number;
}

export type GetCommissionSummaryResponse = CommissionSummary;

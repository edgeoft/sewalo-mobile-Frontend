import { UserProfile } from '@/features/auth/api/types';

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

export interface GetMyTransactionsResponse {
  current_page: number;
  data: Transaction[];
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

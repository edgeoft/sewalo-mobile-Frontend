import { UserProfile, DeliveryType, BookingStatus } from '@/types';
import { PaginatedResponse, DataEnvelope } from './common';

export interface ProviderBookingItem {
  id: string;
  customerName: string;
  customerAvatar: string;
  serviceLabel: string;
  location: string;
  bookingDate: string;
  bookedPrice: string;
  status: BookingStatus;
  cancelReason?: string;
  rejectReason?: string;
}

// Earnings Types
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

// Commission Types
export const COMMISSION_TYPE = {
  MyEarnings: 'owned',
  CommissionDue: 'payable_to_admin',
} as const;

export type CommissionType = (typeof COMMISSION_TYPE)[keyof typeof COMMISSION_TYPE];

export const EARNINGS_FILTER_STATUS = {
  All: 'all',
  Paid: 'paid',
  Unpaid: 'unpaid',
} as const;

export type EarningsFilterStatus = (typeof EARNINGS_FILTER_STATUS)[keyof typeof EARNINGS_FILTER_STATUS];

export interface Commission {
  id: string;
  provider_id: string;
  booking_id: string;
  amount: number;
  total_earned_after_commission: number;
  type: CommissionType;
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

export type GetCommissionsParams = {
  page?: number;
  limit?: number;
  type?: CommissionType;
  has_paid?: boolean;
};

export type GetCommissionsResponse = PaginatedResponse<Commission>;

// Finance Types
export const FINANCE_ACCOUNT_TYPE = {
  Bank: 'bank',
  DigitalWallet: 'wallet',
} as const;

export type FinanceAccountType = (typeof FINANCE_ACCOUNT_TYPE)[keyof typeof FINANCE_ACCOUNT_TYPE];

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

export interface DashboardStats {
  pendingOrders: number;
  completedOrders: number;
  avgRating: number;
  completionRate: string;
}

export interface DashboardMetrics {
  totalEarnings: string;
  profileViews: string;
  acceptanceRate: string;
  acceptanceRating: string;
}

export interface ProviderDashboardResponse {
  stats: DashboardStats;
  metrics: DashboardMetrics;
  recentBookings: ProviderBookingItem[];
}

// Nearby Providers API Types
export interface MapViewport {
  center: { lat: number; lng: number };
  bounds?: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
  zoom?: number;
}

export interface NearbyProvider {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  avg_rating: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  state: string;
  distance_km: number;
}

export type GetNearbyProvidersParams = {
  lat?: number;
  lng?: number;
  sw_lat?: number;
  sw_lng?: number;
  ne_lat?: number;
  ne_lng?: number;
  zoom?: number;
  radius?: number;
  limit?: number;
  category?: string;
  sub_category?: string;
  min_rating?: number;
  max_rating?: number;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  languages?: string;
  service_location?: string;
  search?: string;
};

export type GetNearbyProvidersResponse = DataEnvelope<NearbyProvider[]>;

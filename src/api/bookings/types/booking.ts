import type { UserProfile } from '@/features/auth/api/types';
import type { Service } from '@/api/user/types/service';
import type { Invoice } from './invoice';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'ready_to_pay'
  | 'payment_initiated'
  | 'paid';

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  provider_id: string;
  service_date: string;
  start_time: string;
  additional_note: string | null;
  status: BookingStatus;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: { lat: number; lng: number } | null;
  user: UserProfile;
  service: Service;
  provider: UserProfile;
  invoice: Invoice;
  has_been_rated?: boolean;
  can_be_rated?: boolean;
  rating?: { id: string; rate: number; review: string; created_at: string } | null;
}

export interface BookServiceFormData {
  service_id: string;
  service_date: string;
  start_time: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  additional_note?: string;
  service_offerings?: {
    service_offering_id: string;
    quantity?: number;
    unit_price: number;
  }[];
  service_packages?: {
    service_package_id: string;
    quantity?: number;
    unit_price: number;
  }[];
}

export interface GetBookingsResponse {
  current_page: number;
  data: Booking[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface GetBookingsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface UpdateBookingPayload {
  status?: BookingStatus;
  cancellation_reason?: string;
  additional_note?: string;
  service_date?: string;
  start_time?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
}

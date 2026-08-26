import type { BOOKING_STATUSES } from '@/constants/bookings';
import type { UserProfile, PaymentMethod } from '@/types';
import type { Service } from './services';
import type { PaginatedResponse, DataEnvelope } from './common';

/** Real booking statuses as stored on the entity (no filter pseudo-values). */
export type BookingStatus = Exclude<(typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES], 'all'>;

/** Filter values used by booking list screens ('all' + real statuses). */
export type BookingFilterStatus = 'all' | BookingStatus;

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

export type GetBookingsResponse = PaginatedResponse<Booking>;

export type GetBookingsParams = {
  status?: string;
  page?: number;
  limit?: number;
};

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

export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  discount_type: DiscountType;
  discount_value: number;
  max_use: number;
  assigned_date: string;
  used_count: number;
  remaining_uses: number;
}

export type GetApplicableCouponsResponse = DataEnvelope<Coupon[]>;

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: string;
  total_amount: string;
}

export interface Invoice {
  id: string;
  additional_note: string | null;
  sub_total: string;
  total: string;
}

export type MakePaymentResponse =
  | {
      message: string;
      type: 'cash';
      booking: Booking;
      payment_details: {
        payment_method: string;
        amount: number;
        payment_reference: string;
        payment_notes: string;
        loyalty_points_used: number;
        loyalty_points_discount: number;
        processed_at: string;
      };
    }
  | {
      message: string;
      type: 'esewa';
      booking_id: string;
      invoice: {
        id: string;
        invoice_id: string;
        original_total: number;
        loyalty_points_used: number;
        loyalty_points_discount: number;
        final_amount: number;
      };
      payment: EsewaPaymentDetails;
    };

export interface MakePaymentPayload {
  payment_method: PaymentMethod;
  loyalty_points?: number;
  coupon_id?: string;
}

export interface EsewaPaymentDetails {
  amount: number;
  tax_amount: number;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: number;
  product_delivery_charge: number;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
  api_endpoint: string;
}

export interface ConfirmPaymentPayload {
  has_received_payment: boolean;
}

export interface CreateRatingPayload {
  rate: number;
  review: string;
  provider_id: string;
  booking_id: string;
}

export interface UpdateRatingPayload {
  id: string;
  rate: number;
  review: string;
  provider_id: string;
  booking_id: string;
}

export interface Rating {
  id: string;
  rate: number;
  review: string;
  provider_id: string;
  user_id: string;
  booking_id: string;
  created_at: string;
  updated_at: string;
  provider?: {
    id: string;
    name: string;
    avatar: string | null;
    email?: string | null;
  };
  user: {
    id: string;
    name: string;
    avatar: string | null;
    email?: string | null;
  };
  booking?: {
    id: string;
    provider?: {
      id: string;
      name: string;
      avatar: string | null;
      email?: string | null;
    };
    service?: {
      id?: string;
      name: string;
    };
  };
}

export type GetMyRatingsResponse = PaginatedResponse<Rating>;

export type GetProviderRatingResponse = DataEnvelope<Rating[]>;

export type GetProviderRatingsParams = {
  page?: number;
  limit?: number;
};

export type GetMyRatingsParams = {
  page?: number;
  limit?: number;
};

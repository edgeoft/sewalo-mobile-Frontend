import type { UserProfile, PaymentMethod } from '@/types';
import type { Service } from './services';
import { PaginatedResponse } from './common';

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

export type GetBookingsResponse = PaginatedResponse<Booking>;

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

export interface GetApplicableCouponsResponse {
  data: Coupon[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  quantity: number;
  unit_price: string;
  total_amount: string;
  is_primary_item: boolean;
}

export interface Invoice {
  id: string;
  invoice_id: string;
  booking_id: string;
  additional_note: string | null;
  sub_total: string;
  discount_amount: string;
  coupon_discount: string;
  coupon_id: string | null;
  vat: string;
  loyalty_points_used: number;
  loyalty_points_discount: string;
  total: string;
  total_amount_paid: string;
  invoice_items: InvoiceItem[];
}

export interface InvoiceItemToAdd {
  name: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceItemToUpdate {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface UpdateInvoiceItemsPayload {
  id: string;
  additional_note: string;
  discount_amount: number;
  items_to_add: InvoiceItemToAdd[];
  items_to_update: InvoiceItemToUpdate[];
  items_to_delete: string[];
}

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
  provider: {
    id: string;
    name: string;
    avatar: string | null;
  };
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  booking: {
    id: string;
    service: {
      name: string;
    };
  };
}

export type GetMyRatingsResponse = PaginatedResponse<Rating>;

export interface GetMyRatingsParams {
  page?: number;
  limit?: number;
}

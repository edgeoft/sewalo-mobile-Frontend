import type { PaymentMethod } from '@/types';
import type { Booking } from './booking';

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

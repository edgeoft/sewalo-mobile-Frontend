import { internalClient } from '@/api/clients/internal';
import type { MakePaymentPayload, MakePaymentResponse, ConfirmPaymentPayload } from '../types/payment';
import type { Booking } from '../types/booking';

export const processPaymentAction = async (
  bookingId: string,
  payload: MakePaymentPayload,
): Promise<MakePaymentResponse> => {
  return internalClient.post<MakePaymentResponse>(`/bookings/${bookingId}/payment`, payload);
};

export const confirmPaymentAction = async (bookingId: string, payload: ConfirmPaymentPayload): Promise<Booking> => {
  return internalClient.post<Booking>(`/bookings/${bookingId}/confirm-payment`, payload);
};

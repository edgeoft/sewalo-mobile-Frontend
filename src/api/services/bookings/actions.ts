import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { internalClient } from '@/api/client/instances/internal';
import { ENV } from '@/constants/env';
import type {
  Booking,
  BookServiceFormData,
  GetBookingsResponse,
  GetBookingsParams,
  UpdateBookingPayload,
  GetApplicableCouponsResponse,
  UpdateInvoiceItemsPayload,
  MakePaymentPayload,
  MakePaymentResponse,
  ConfirmPaymentPayload,
  CreateRatingPayload,
  UpdateRatingPayload,
  Rating,
  GetMyRatingsResponse,
  GetMyRatingsParams,
} from '@/types';

// Booking Actions
export const createBookingAction = async (data: BookServiceFormData): Promise<Booking> => {
  return internalClient.post<Booking>('/bookings', data);
};

export const getBookingsAction = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  return internalClient.get<GetBookingsResponse>('/bookings', { params });
};

export const getMyBookingsAction = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  return internalClient.get<GetBookingsResponse>('/bookings/my-bookings', { params });
};

export const getBookingByIdAction = async (id: string): Promise<Booking> => {
  return internalClient.get<Booking>(`/bookings/${id}`);
};

export const updateBookingAction = async (id: string, data: UpdateBookingPayload): Promise<Booking> => {
  return internalClient.put<Booking>(`/bookings/${id}`, data);
};

export const cancelBookingAction = async (
  id: string,
  cancellation_reason?: string,
): Promise<{ message: string; booking: Booking }> => {
  return internalClient.delete<{ message: string; booking: Booking }>(`/bookings/${id}`, {
    data: cancellation_reason ? { cancellation_reason } : undefined,
  });
};

// Coupon Actions
export const getApplicableCouponsAction = async (): Promise<GetApplicableCouponsResponse> => {
  return internalClient.get<GetApplicableCouponsResponse>('/user/applicable-coupons');
};

// Download Actions
export const downloadInvoiceAction = async (invoiceId: string): Promise<string> => {
  const token = await internalClient.tokenManager?.getAccessToken();
  const url = `${ENV.API_BASE_URL}/invoices/${invoiceId}/download`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fileUri = `${FileSystem.cacheDirectory}invoice-${invoiceId}.pdf`;

  const result = await FileSystem.downloadAsync(url, fileUri, { headers });

  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Download Invoice',
  });

  return result.uri;
};

// Invoice Actions
export const updateInvoiceItemsAction = async (payload: UpdateInvoiceItemsPayload): Promise<void> => {
  return internalClient.post(`/invoices/${payload.id}/update-with-items`, payload);
};

// Payment Actions
export const processPaymentAction = async (
  bookingId: string,
  payload: MakePaymentPayload,
): Promise<MakePaymentResponse> => {
  return internalClient.post<MakePaymentResponse>(`/bookings/${bookingId}/payment`, payload);
};

export const confirmPaymentAction = async (bookingId: string, payload: ConfirmPaymentPayload): Promise<Booking> => {
  return internalClient.post<Booking>(`/bookings/${bookingId}/confirm-payment`, payload);
};

// Rating Actions
export const createRatingAction = async (payload: CreateRatingPayload): Promise<Rating> => {
  return internalClient.post('/ratings', payload);
};

export const getMyRatingsAction = async (params: GetMyRatingsParams = {}): Promise<GetMyRatingsResponse> => {
  return internalClient.get('/ratings/my-ratings', { params });
};

export const updateRatingAction = async ({ id, ...payload }: UpdateRatingPayload): Promise<Rating> => {
  return internalClient.put(`/ratings/${id}`, payload);
};

export const deleteRatingAction = async (id: string): Promise<void> => {
  return internalClient.delete(`/ratings/${id}`);
};

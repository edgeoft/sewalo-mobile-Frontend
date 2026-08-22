import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import { ENV } from '@/constants/env';
import type {
  Booking,
  BookServiceFormData,
  GetBookingsResponse,
  GetBookingsParams,
  UpdateBookingPayload,
  GetApplicableCouponsResponse,
  MakePaymentPayload,
  MakePaymentResponse,
  ConfirmPaymentPayload,
  CreateRatingPayload,
  UpdateRatingPayload,
  Rating,
  GetMyRatingsResponse,
  GetMyRatingsParams,
  GetProviderRatingResponse,
} from '@/types';

// Booking Actions
export const createBookingAction = async (data: BookServiceFormData): Promise<Booking> => {
  return internalClient.post<Booking>(API_ENDPOINTS.BOOKINGS.BASE, data);
};

export const getBookingsAction = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  return internalClient.get<GetBookingsResponse>(API_ENDPOINTS.BOOKINGS.LIST, { params });
};

export const getMyBookingsAction = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  return internalClient.get<GetBookingsResponse>(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, { params });
};

export const getBookingByIdAction = async (id: string): Promise<Booking> => {
  return internalClient.get<Booking>(API_ENDPOINTS.BOOKINGS.DETAIL(id));
};

export const updateBookingAction = async (id: string, data: UpdateBookingPayload): Promise<Booking> => {
  return internalClient.put<Booking>(API_ENDPOINTS.BOOKINGS.UPDATE(id), data);
};

export const cancelBookingAction = async (
  id: string,
  cancellation_reason?: string,
): Promise<{ message: string; booking: Booking }> => {
  return internalClient.delete<{ message: string; booking: Booking }>(API_ENDPOINTS.BOOKINGS.CANCEL(id), {
    data: cancellation_reason ? { cancellation_reason } : undefined,
  });
};

// Coupon Actions
export const getApplicableCouponsAction = async (): Promise<GetApplicableCouponsResponse> => {
  return internalClient.get<GetApplicableCouponsResponse>(API_ENDPOINTS.USER.APPLICABLE_COUPONS);
};

// Download Actions
export const downloadInvoiceAction = async (invoiceId: string): Promise<string> => {
  const token = await internalClient.tokenManager?.getAccessToken();
  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.DOWNLOAD(invoiceId)}`;

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

// Payment Actions
export const processPaymentAction = async (
  bookingId: string,
  payload: MakePaymentPayload,
): Promise<MakePaymentResponse> => {
  return internalClient.post<MakePaymentResponse>(API_ENDPOINTS.BOOKINGS.PAYMENT(bookingId), payload);
};

export const confirmPaymentAction = async (bookingId: string, payload: ConfirmPaymentPayload): Promise<Booking> => {
  return internalClient.post<Booking>(API_ENDPOINTS.BOOKINGS.CONFIRM_PAYMENT(bookingId), payload);
};

// Rating Actions
export const createRatingAction = async (payload: CreateRatingPayload): Promise<Rating> => {
  return internalClient.post<Rating>(API_ENDPOINTS.RATINGS.BASE, payload);
};

export const getMyRatingsAction = async (params: GetMyRatingsParams = {}): Promise<GetMyRatingsResponse> => {
  return internalClient.get<GetMyRatingsResponse>(API_ENDPOINTS.RATINGS.MY_RATINGS, { params });
};

export const getProviderRatingsAction = async (providerId: string): Promise<GetProviderRatingResponse> => {
  return internalClient.get<GetProviderRatingResponse>(API_ENDPOINTS.RATINGS.PROVIDER_RATINGS(providerId));
};

export const updateRatingAction = async ({ id, ...payload }: UpdateRatingPayload): Promise<Rating> => {
  return internalClient.put<Rating>(API_ENDPOINTS.RATINGS.UPDATE(id), payload);
};

export const deleteRatingAction = async (id: string): Promise<void> => {
  return internalClient.delete<void>(API_ENDPOINTS.RATINGS.DELETE(id));
};

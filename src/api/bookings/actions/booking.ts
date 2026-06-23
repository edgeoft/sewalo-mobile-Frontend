import { internalClient } from '@/api/clients/internal';
import type {
  Booking,
  BookServiceFormData,
  GetBookingsResponse,
  GetBookingsParams,
  UpdateBookingPayload,
} from '../types/booking';

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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBookingAction,
  getBookingsAction,
  getMyBookingsAction,
  getBookingByIdAction,
  updateBookingAction,
  cancelBookingAction,
} from '../actions/booking';
import type {
  Booking,
  BookServiceFormData,
  GetBookingsResponse,
  GetBookingsParams,
  UpdateBookingPayload,
} from '../types/booking';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, BookServiceFormData>({
    mutationFn: createBookingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

export const useGetBookingsQuery = (params: GetBookingsParams = {}) => {
  return useQuery<GetBookingsResponse, Error>({
    queryKey: ['bookings', params],
    queryFn: () => getBookingsAction(params),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 2000,
  });
};

export const useGetMyBookingsQuery = (params: GetBookingsParams = {}) => {
  return useQuery<GetBookingsResponse, Error>({
    queryKey: ['my-bookings', params],
    queryFn: () => getMyBookingsAction(params),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 2000,
  });
};

export const useGetBookingByIdQuery = (id: string) => {
  return useQuery<Booking, Error>({
    queryKey: ['booking', id],
    queryFn: () => getBookingByIdAction(id),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 2000,
    enabled: !!id,
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { id: string; data: UpdateBookingPayload }>({
    mutationFn: ({ id, data }) => updateBookingAction(id, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['booking', result.id], result);
      queryClient.invalidateQueries({ queryKey: ['booking', result.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; booking: Booking }, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => cancelBookingAction(id, reason),
    onSuccess: (result) => {
      queryClient.setQueryData(['booking', result.booking.id], result.booking);
      queryClient.invalidateQueries({ queryKey: ['booking', result.booking.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

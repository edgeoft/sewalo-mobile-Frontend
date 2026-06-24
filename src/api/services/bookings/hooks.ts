import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBookingAction,
  getBookingsAction,
  getMyBookingsAction,
  getBookingByIdAction,
  updateBookingAction,
  cancelBookingAction,
  getApplicableCouponsAction,
  downloadInvoiceAction,
  updateInvoiceItemsAction,
  processPaymentAction,
  confirmPaymentAction,
  createRatingAction,
  getMyRatingsAction,
  updateRatingAction,
  deleteRatingAction,
} from './actions';
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

// Booking Hooks
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
    refetchInterval: 1800000,
  });
};

export const useGetMyBookingsQuery = (params: GetBookingsParams = {}) => {
  return useQuery<GetBookingsResponse, Error>({
    queryKey: ['my-bookings', params],
    queryFn: () => getMyBookingsAction(params),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 1800000,
  });
};

export const useGetBookingByIdQuery = (id: string) => {
  return useQuery<Booking, Error>({
    queryKey: ['booking', id],
    queryFn: () => getBookingByIdAction(id),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 1800000,
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

// Coupon Hooks
export const useGetApplicableCoupons = () => {
  return useQuery<GetApplicableCouponsResponse, Error>({
    queryKey: ['applicable-coupons'],
    queryFn: getApplicableCouponsAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Download Hooks
export const useDownloadInvoice = () => {
  return useMutation<string, Error, string>({
    mutationFn: downloadInvoiceAction,
  });
};

// Invoice Hooks
export const useUpdateInvoiceItems = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateInvoiceItemsPayload>({
    mutationFn: updateInvoiceItemsAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
};

// Payment Hooks
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<MakePaymentResponse, Error, { bookingId: string; payload: MakePaymentPayload }>({
    mutationFn: ({ bookingId, payload }) => processPaymentAction(bookingId, payload),
    onSuccess: (result, variables) => {
      if (result.type === 'cash' && result.booking) {
        queryClient.setQueryData(['booking', result.booking.id], result.booking);
        queryClient.invalidateQueries({ queryKey: ['booking', result.booking.id], refetchType: 'all' });
      } else {
        queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId], refetchType: 'all' });
      }
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { bookingId: string; payload: ConfirmPaymentPayload }>({
    mutationFn: ({ bookingId, payload }) => confirmPaymentAction(bookingId, payload),
    onSuccess: (result) => {
      queryClient.setQueryData(['booking', result.id], result);
      queryClient.invalidateQueries({ queryKey: ['booking', result.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// Rating Hooks
export const useCreateRating = () => {
  const queryClient = useQueryClient();
  return useMutation<Rating, Error, CreateRatingPayload>({
    mutationFn: createRatingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });
};

export const useGetMyRatingsQuery = (params: GetMyRatingsParams = {}) => {
  return useQuery<GetMyRatingsResponse, Error>({
    queryKey: ['my-ratings', params],
    queryFn: () => getMyRatingsAction(params),
    retry: false,
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();
  return useMutation<Rating, Error, UpdateRatingPayload>({
    mutationFn: updateRatingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteRatingAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
    },
  });
};

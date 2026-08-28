import { createQueryHook, createMutationHook } from '@/api/client/query/factory';
import { useQueryClient, useMutation, type QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  createBookingAction,
  getBookingsAction,
  getBookingByIdAction,
  updateBookingAction,
  cancelBookingAction,
  getApplicableCouponsAction,
  downloadInvoiceAction,
  processPaymentAction,
  confirmPaymentAction,
  createRatingAction,
  getMyRatingsAction,
  getProviderRatingsAction,
  updateRatingAction,
  deleteRatingAction,
} from './actions';

import {
  PAYMENT_METHODS,
  type Booking,
  type BookServiceFormData,
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
  GetProviderRatingsParams,
} from '@/types';

export const invalidateBookingDetail = (queryClient: QueryClient, bookingId: string, booking?: Booking) => {
  if (booking) {
    queryClient.setQueryData(QUERY_KEYS.BOOKINGS.DETAIL(booking.id), booking);
  }
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.DETAIL(bookingId) });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.ALL });
};

// Booking Hooks
export const useCreateBooking = createMutationHook<Booking, BookServiceFormData>(createBookingAction, {
  invalidateKeys: () => [QUERY_KEYS.BOOKINGS.ALL],
});

const bookingsListQueryHook = createQueryHook<GetBookingsResponse, GetBookingsParams | undefined>(
  (params) => QUERY_KEYS.BOOKINGS.LIST(params ?? {}),
  (params) => getBookingsAction(params ?? {}),
);

export const useGetBookingsQuery = (params: GetBookingsParams = {}) => bookingsListQueryHook(params);

const bookingByIdQueryHook = createQueryHook<Booking, string>(
  (id) => QUERY_KEYS.BOOKINGS.DETAIL(id),
  (id) => getBookingByIdAction(id),
);

export const useGetBookingByIdQuery = (id: string) => bookingByIdQueryHook(id, { enabled: !!id });

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { id: string; data: UpdateBookingPayload }>({
    mutationFn: ({ id, data }) => updateBookingAction(id, data),
    onSuccess: (result) => {
      invalidateBookingDetail(queryClient, result.id, result);
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; booking: Booking }, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => cancelBookingAction(id, reason),
    onSuccess: (result) => {
      invalidateBookingDetail(queryClient, result.booking.id, result.booking);
    },
  });
};

// Coupon Hooks
const applicableCouponsQueryHook = createQueryHook<GetApplicableCouponsResponse, string | undefined>(
  (bookingId) => QUERY_KEYS.APPLICABLE_COUPONS(bookingId),
  (bookingId) => getApplicableCouponsAction(bookingId),
);

export const useGetApplicableCoupons = (bookingId?: string, options?: { enabled?: boolean }) =>
  applicableCouponsQueryHook(bookingId, { enabled: options?.enabled ?? true });

// Download Hooks
export const useDownloadInvoice = createMutationHook<string, string>(downloadInvoiceAction);

// Payment Hooks
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<MakePaymentResponse, Error, { bookingId: string; payload: MakePaymentPayload }>({
    mutationFn: ({ bookingId, payload }) => processPaymentAction(bookingId, payload),
    onSuccess: (result, variables) => {
      if (result.type === PAYMENT_METHODS.Cash && result.booking) {
        invalidateBookingDetail(queryClient, result.booking.id, result.booking);
      } else {
        invalidateBookingDetail(queryClient, variables.bookingId);
      }
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { bookingId: string; payload: ConfirmPaymentPayload }>({
    mutationFn: ({ bookingId, payload }) => confirmPaymentAction(bookingId, payload),
    onSuccess: (result) => {
      invalidateBookingDetail(queryClient, result.id, result);
    },
  });
};

// Rating Hooks
export const useCreateRating = createMutationHook<Rating, CreateRatingPayload>(createRatingAction, {
  invalidateKeys: () => [QUERY_KEYS.BOOKINGS.BASE, QUERY_KEYS.MY_RATINGS.ALL],
});

const providerRatingsQueryHook = createQueryHook<GetProviderRatingResponse, string>(
  (providerId) => QUERY_KEYS.PROVIDER_RATINGS(providerId),
  (providerId) => getProviderRatingsAction(providerId),
);

export const useGetProviderRatingsQuery = (
  providerId: string,
  options?: { enabled?: boolean; params?: GetProviderRatingsParams },
) =>
  providerRatingsQueryHook(providerId, {
    enabled: (options?.enabled ?? true) && Boolean(providerId),
  });

const myRatingsQueryHook = createQueryHook<GetMyRatingsResponse, GetMyRatingsParams | undefined>(
  (params) => QUERY_KEYS.MY_RATINGS.LIST(params ?? {}),
  (params) => getMyRatingsAction(params ?? {}),
);

export const useGetMyRatingsQuery = (params: GetMyRatingsParams = {}) => myRatingsQueryHook(params);

export const useUpdateRating = createMutationHook<Rating, UpdateRatingPayload>(updateRatingAction, {
  invalidateKeys: () => [QUERY_KEYS.MY_RATINGS.ALL],
});

export const useDeleteRating = createMutationHook<void, string>(deleteRatingAction, {
  invalidateKeys: () => [QUERY_KEYS.MY_RATINGS.ALL],
});

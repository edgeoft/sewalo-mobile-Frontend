import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processPaymentAction, confirmPaymentAction } from '../actions/payment';
import type { MakePaymentPayload, MakePaymentResponse, ConfirmPaymentPayload } from '../types/payment';
import type { Booking } from '../types/booking';

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

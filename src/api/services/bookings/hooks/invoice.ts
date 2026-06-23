import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateInvoiceItemsAction } from '../actions/invoice';
import type { UpdateInvoiceItemsPayload } from '@/types';

export const useUpdateInvoiceItems = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateInvoiceItemsPayload>({
    mutationFn: updateInvoiceItemsAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
};

import { internalClient } from '@/api/client/instances/internal';
import type { UpdateInvoiceItemsPayload } from '@/types';

export const updateInvoiceItemsAction = async (payload: UpdateInvoiceItemsPayload): Promise<void> => {
  return internalClient.post(`/invoices/${payload.id}/update-with-items`, payload);
};

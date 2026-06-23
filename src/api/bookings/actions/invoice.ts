import { internalClient } from '@/api/clients/internal';
import type { UpdateInvoiceItemsPayload } from '../types/invoice';

export const updateInvoiceItemsAction = async (payload: UpdateInvoiceItemsPayload): Promise<void> => {
  return internalClient.post(`/invoices/${payload.id}/update-with-items`, payload);
};

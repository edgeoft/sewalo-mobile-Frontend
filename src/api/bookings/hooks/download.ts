import { useMutation } from '@tanstack/react-query';
import { downloadInvoiceAction } from '../actions/download';

export const useDownloadInvoice = () => {
  return useMutation<string, Error, string>({
    mutationFn: downloadInvoiceAction,
  });
};

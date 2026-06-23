import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { internalClient } from '@/api/clients/internal';
import { ENV } from '@/constants/env';

export const downloadInvoiceAction = async (invoiceId: string): Promise<string> => {
  const token = await internalClient.tokenManager?.getAccessToken();
  const url = `${ENV.API_BASE_URL}/invoices/${invoiceId}/download`;

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

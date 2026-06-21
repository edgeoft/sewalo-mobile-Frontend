import { internalClient } from '@/api';
import { GetEarningSummaryResponse, GetMyTransactionsParams, GetMyTransactionsResponse } from '../types/earnings';

export const getEarningSummaryAction = async (): Promise<GetEarningSummaryResponse> => {
  return internalClient.get<GetEarningSummaryResponse>('/transactions/earnings/summary');
};

export const getMyTransactionsAction = async ({
  page = 1,
  limit = 10,
}: GetMyTransactionsParams): Promise<GetMyTransactionsResponse> => {
  return internalClient.get<GetMyTransactionsResponse>('/transactions', {
    params: {
      page,
      limit,
    },
  });
};

import { internalClient } from '@/api/client/instances/internal';
import { GetEarningSummaryResponse, GetMyTransactionsParams, GetMyTransactionsResponse } from '@/types';

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

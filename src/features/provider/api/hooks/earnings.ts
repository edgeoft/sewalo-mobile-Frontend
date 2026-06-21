import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getEarningSummaryAction, getMyTransactionsAction } from '../actions/earnings';
import { GetEarningSummaryResponse, GetMyTransactionsResponse } from '../types/earnings';

export const useEarningSummaryQuery = (
  options?: Omit<UseQueryOptions<GetEarningSummaryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetEarningSummaryResponse, Error>({
    queryKey: ['earning-summary'],
    queryFn: getEarningSummaryAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useMyTransactionsQuery = (
  params: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<GetMyTransactionsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  return useQuery<GetMyTransactionsResponse, Error>({
    queryKey: ['my-transactions', page, limit],
    queryFn: () => getMyTransactionsAction({ page, limit }),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCommissionSummaryAction, getCommissionsAction } from '../actions/commissions';
import { GetCommissionsParams, GetCommissionsResponse, GetCommissionSummaryResponse } from '@/types';

export const useCommissionSummaryQuery = (
  options?: Omit<UseQueryOptions<GetCommissionSummaryResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetCommissionSummaryResponse, Error>({
    queryKey: ['commission-summary'],
    queryFn: getCommissionSummaryAction,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCommissionsQuery = (
  params: GetCommissionsParams,
  options?: Omit<UseQueryOptions<GetCommissionsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetCommissionsResponse, Error>({
    queryKey: ['commissions', params],
    queryFn: () => getCommissionsAction(params),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

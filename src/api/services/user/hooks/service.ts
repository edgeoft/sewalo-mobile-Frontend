import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getServiceListAction } from '../actions/service';
import { GetServiceListParams, GetServiceListResponse } from '@/types';

export const useGetServicesQuery = (
  params: GetServiceListParams,
  options?: Omit<UseQueryOptions<GetServiceListResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<GetServiceListResponse, Error>({
    queryKey: ['service-list', params],
    queryFn: () => getServiceListAction(params),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

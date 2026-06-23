import { internalClient } from '@/api/client/instances/internal';
import { GetServiceListParams, GetServiceListResponse } from '@/types';

export const getServiceListAction = async (params: GetServiceListParams): Promise<GetServiceListResponse> => {
  return internalClient.get<GetServiceListResponse>('/services', {
    params: {
      page: params.page || 1,
      limit: params.limit || 15,
      ...params,
    },
  });
};

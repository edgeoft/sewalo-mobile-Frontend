import { internalClient } from '@/api';
import { GetCommissionsParams, GetCommissionsResponse, GetCommissionSummaryResponse } from '../types/commissions';

export const getCommissionSummaryAction = async (): Promise<GetCommissionSummaryResponse> => {
  return internalClient.get<GetCommissionSummaryResponse>('/commissions/summary');
};

export const getCommissionsAction = async (params: GetCommissionsParams): Promise<GetCommissionsResponse> => {
  return internalClient.get<GetCommissionsResponse>('/commissions', {
    params,
  });
};

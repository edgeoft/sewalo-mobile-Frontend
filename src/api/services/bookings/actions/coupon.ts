import { internalClient } from '@/api/client/instances/internal';
import type { GetApplicableCouponsResponse } from '@/types';

export const getApplicableCouponsAction = async (): Promise<GetApplicableCouponsResponse> => {
  return internalClient.get<GetApplicableCouponsResponse>('/user/applicable-coupons');
};

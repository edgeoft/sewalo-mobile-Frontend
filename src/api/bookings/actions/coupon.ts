import { internalClient } from '@/api/clients/internal';
import type { GetApplicableCouponsResponse } from '../types/coupon';

export const getApplicableCouponsAction = async (): Promise<GetApplicableCouponsResponse> => {
  return internalClient.get<GetApplicableCouponsResponse>('/user/applicable-coupons');
};

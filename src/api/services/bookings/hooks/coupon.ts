import { useQuery } from '@tanstack/react-query';
import { getApplicableCouponsAction } from '../actions/coupon';
import type { GetApplicableCouponsResponse } from '@/types';

export const useGetApplicableCoupons = () => {
  return useQuery<GetApplicableCouponsResponse, Error>({
    queryKey: ['applicable-coupons'],
    queryFn: getApplicableCouponsAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

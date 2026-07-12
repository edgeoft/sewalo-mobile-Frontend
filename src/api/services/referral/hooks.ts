import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getReferralCodeAction, getReferralStatsAction } from './actions';
import type { ReferralCodeResponse, ReferralStatsResponse } from '@/types';

export const useReferralCodeQuery = () => {
  return useQuery<ReferralCodeResponse, Error>({
    queryKey: QUERY_KEYS.REFERRAL_CODE,
    queryFn: getReferralCodeAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useReferralStatsQuery = () => {
  return useQuery<ReferralStatsResponse, Error>({
    queryKey: QUERY_KEYS.REFERRAL_STATS,
    queryFn: getReferralStatsAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

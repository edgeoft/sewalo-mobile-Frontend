import { useQuery } from '@tanstack/react-query';
import { getReferralCodeAction, getReferralStatsAction } from '../actions/referral';
import type { ReferralCodeResponse, ReferralStatsResponse } from '@/types';

export const useReferralCodeQuery = () => {
  return useQuery<ReferralCodeResponse, Error>({
    queryKey: ['referral-code'],
    queryFn: getReferralCodeAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useReferralStatsQuery = () => {
  return useQuery<ReferralStatsResponse, Error>({
    queryKey: ['referral-stats'],
    queryFn: getReferralStatsAction,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

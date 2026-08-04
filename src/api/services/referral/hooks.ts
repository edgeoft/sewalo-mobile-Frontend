import { createQueryHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getReferralCodeAction, getReferralStatsAction } from './actions';
import type { ReferralCodeResponse, ReferralStatsResponse } from '@/types';

export const useReferralCodeQuery = createQueryHook<ReferralCodeResponse, void>(
  () => QUERY_KEYS.REFERRAL_CODE,
  getReferralCodeAction,
);

export const useReferralStatsQuery = createQueryHook<ReferralStatsResponse, void>(
  () => QUERY_KEYS.REFERRAL_STATS,
  getReferralStatsAction,
);

import { createQueryHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getReferralCodeAction, getReferralStatsAction } from './actions';
import type { ReferralCodeResponse, ReferralStatsResponse } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { ApiError } from '@/api/client/types';

const referralCodeQueryHook = createQueryHook<ReferralCodeResponse, void>(
  () => QUERY_KEYS.REFERRAL_CODE,
  getReferralCodeAction,
);

const referralStatsQueryHook = createQueryHook<ReferralStatsResponse, void>(
  () => QUERY_KEYS.REFERRAL_STATS,
  getReferralStatsAction,
);

export const useReferralCodeQuery = (options?: Partial<UseQueryOptions<ReferralCodeResponse, ApiError>>) =>
  referralCodeQueryHook(undefined, options);

export const useReferralStatsQuery = (options?: Partial<UseQueryOptions<ReferralStatsResponse, ApiError>>) =>
  referralStatsQueryHook(undefined, options);

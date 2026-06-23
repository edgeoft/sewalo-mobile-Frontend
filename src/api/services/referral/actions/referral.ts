import { internalClient } from '@/api/client/instances/internal';
import type { ReferralCodeResponse, ReferralStatsResponse } from '@/types';

export const getReferralCodeAction = async (): Promise<ReferralCodeResponse> => {
  return internalClient.get<ReferralCodeResponse>('/user/referral-code');
};

export const getReferralStatsAction = async (): Promise<ReferralStatsResponse> => {
  return internalClient.get<ReferralStatsResponse>('/user/referral-stats');
};

import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import type { ReferralCodeResponse, ReferralStatsResponse } from '@/types';

export const getReferralCodeAction = async (): Promise<ReferralCodeResponse> => {
  return internalClient.get<ReferralCodeResponse>(API_ENDPOINTS.USER.REFERRAL_CODE);
};

export const getReferralStatsAction = async (): Promise<ReferralStatsResponse> => {
  return internalClient.get<ReferralStatsResponse>(API_ENDPOINTS.USER.REFERRAL_STATS);
};

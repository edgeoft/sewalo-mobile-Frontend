import type { DataEnvelope } from './common';

export interface ReferralCodeData {
  referral_code: string;
  status: string;
}

export type ReferralCodeResponse = DataEnvelope<ReferralCodeData | null>;

export interface ReferralStatsData {
  total_referred: number;
  referral_code: string | null;
}

export type ReferralStatsResponse = DataEnvelope<ReferralStatsData>;

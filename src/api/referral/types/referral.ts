export interface ReferralCodeData {
  referral_code: string;
  status: string;
  created_at: string | null;
}

export interface ReferralCodeResponse {
  success: boolean;
  message: string;
  data: ReferralCodeData | null;
}

export interface ReferralStatsByStatus {
  pending: number;
  verified: number;
  added: number;
}

export interface ReferralStatsData {
  total_referred: number;
  by_status: ReferralStatsByStatus;
  referral_code: string | null;
}

export interface ReferralStatsResponse {
  success: boolean;
  message: string;
  data: ReferralStatsData;
}

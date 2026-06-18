import { UserProfile } from '@/features/auth/api/types';

export type UserStatus = 'pending' | 'completed' | 'verified' | 'rejected' | 'suspended';
export type Availability = 'always' | 'weekends' | 'weekdays';

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface EducationItemPayload {
  id?: number;
  degree: string;
  institute: string;
  start_date: string;
  end_date?: string | null;
}

export interface ExperienceItemPayload {
  id?: number;
  title: string;
  company_name: string;
  start_date: string;
  end_date?: string | null;
}

export interface UpdateProfilePayload {
  avatar?: string | null;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  dob?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  availability?: Availability;
  start_time?: string;
  end_time?: string;
  document?: string | null;
  education?: EducationItemPayload[];
  experience?: ExperienceItemPayload[];
  language?: string[];
}

export interface CompleteProfilePayload {
  email: string;
  city: string;
  state: string;
  country: string;
  address: string;
  dob: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  avatar?: string | null;
  document?: string | null;
  description?: string;
  education?: EducationItemPayload[];
  experience?: ExperienceItemPayload[];
  availability?: Availability | string;
  start_time?: string;
  end_time?: string;
  language?: string[];
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

export enum FinanceAccountType {
  BANK = 'bank',
  WALLET = 'wallet',
}

export interface FinanceAccount {
  id: number;
  user_id: string;
  name: string;
  account_holder_name: string;
  account_no: string;
  type: FinanceAccountType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFinanceAccountPayload {
  name: string;
  account_holder_name: string;
  account_no: string;
  type: FinanceAccountType;
  is_default?: boolean;
}

export interface GetFinanceAccountsResponse {
  current_page: number;
  data: FinanceAccount[];
  total: number;
}

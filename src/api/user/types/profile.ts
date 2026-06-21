import { UserProfile } from '@/features/auth/api/types';
import { FinanceAccountType } from '@/features/provider/types/finance';

export { FinanceAccountType };

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
  description?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

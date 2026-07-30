import { USER_ROLES, USER_STATUSES } from '@/constants/roles';
import { Service } from './services';

// Profile types
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
export type Availability = 'always' | 'weekends' | 'weekdays';

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  slug: string;
  role: UserRole;
  available_roles?: UserRole[];
  status: UserStatus;
  status_message?: string;
  avatar: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  dob: string | null;
  loyalty_points: number;
  phone_verified_at: string | null;
  email_verified_at: string | null;
  description: string | null;
  education:
    | {
        id: number;
        degree: string;
        institute: string;
        start_date: string;
        end_date?: string | null;
      }[]
    | null;
  experience:
    | {
        id: number;
        title: string;
        company_name: string;
        start_date: string;
        end_date: string | null;
      }[]
    | null;
  document: string | null;
  coordinates: { lat: number; lng: number } | null;
  availability: string | null;
  availability_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  profile_views: number | null;
  avg_rating: number | null;
  average_rating?: string;
  total_ratings?: number;
  profile_verified_at: string | null;
  last_login_at: string | null;
  certificates: string[] | null;
  language: string[] | null;
}

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

export interface ProviderDetailsResponse {
  provider: UserProfile;
  services: Service[];
}

// Onboarding types
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

export interface PersonalInfoData {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  location: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  dateOfBirth: string;
  languages?: string[];
  avatar: string;
}

// Password types
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// Role Switching types (strictly restricted to customer and provider)
export type SwitchTargetRole = 'customer' | 'provider';

export interface SwitchRolePayload {
  target_role: SwitchTargetRole;
}

export interface SwitchRoleResponse {
  message: string;
  user: UserProfile;
}

export interface SwitchRoleWithDetailsPayload {
  target_role: 'provider'; // detail switches are only applicable when becoming a provider
  availability: Availability | string;
  availability_days: string[];
  start_time: string;
  end_time: string;
  document: string | null;
}

export interface SwitchRoleWithDetailsResponse {
  message: string;
  user: UserProfile;
}

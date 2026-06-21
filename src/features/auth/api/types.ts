import { UserRole } from '@/types';

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  slug: string;
  role: UserRole;
  current_role: UserRole;
  status: string;
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
  profile_verified_at: string | null;
  last_login_at: string | null;
  certificates: string[] | null;
  language: string[] | null;
}

export interface SignupInput {
  name: string;
  email?: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: string;
  referral_code?: string;
}

export interface SignupResponse {
  message: string;
  user: UserProfile;
  otp?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: UserProfile;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface VerifyOtpInput {
  phone: string;
  otp: string;
  type: 'signup' | 'login' | 'reset_password';
}

export interface VerifyOtpResponse {
  message: string;
  user?: UserProfile;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface ResendOtpInput {
  phone: string;
  type: 'signup' | 'login' | 'reset_password';
}

export interface ResendOtpResponse {
  message: string;
  otp?: string;
}

export interface ForgotPasswordInput {
  phone: string;
}

export interface ForgotPasswordResponse {
  message: string;
  otp?: string;
}

export interface ResetPasswordInput {
  phone: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface GetProfileResponse {
  user: UserProfile;
}

export interface LogoutResponse {
  message: string;
}

import { internalClient } from '@/api/clients/internal';
import {
  SignupInput,
  SignupResponse,
  LoginInput,
  LoginResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
  ResendOtpInput,
  ResendOtpResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  GetProfileResponse,
  LogoutResponse,
} from './types';

// API client endpoints
export const signupAction = async (data: SignupInput): Promise<SignupResponse> => {
  return internalClient.post<SignupResponse>('/auth/signup', data);
};

export const loginAction = async (data: LoginInput): Promise<LoginResponse> => {
  return internalClient.post<LoginResponse>('/auth/login', data);
};

export const verifyOtpAction = async (data: VerifyOtpInput): Promise<VerifyOtpResponse> => {
  return internalClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
};

export const resendOtpAction = async (data: ResendOtpInput): Promise<ResendOtpResponse> => {
  return internalClient.post<ResendOtpResponse>('/auth/resend-otp', data);
};

export const forgotPasswordAction = async (data: ForgotPasswordInput): Promise<ForgotPasswordResponse> => {
  return internalClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
};

export const resetPasswordAction = async (data: ResetPasswordInput): Promise<ResetPasswordResponse> => {
  return internalClient.post<ResetPasswordResponse>('/auth/reset-password', data);
};

export const getProfileAction = async (): Promise<GetProfileResponse> => {
  return internalClient.get<GetProfileResponse>('/user');
};

export const logoutAction = async (): Promise<LogoutResponse> => {
  return internalClient.post<LogoutResponse>('/logout');
};

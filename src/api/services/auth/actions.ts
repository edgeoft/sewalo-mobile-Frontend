import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
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
} from '@/types';

// API client endpoints
export const signupAction = async (data: SignupInput): Promise<SignupResponse> => {
  return internalClient.post<SignupResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
};

export const loginAction = async (data: LoginInput): Promise<LoginResponse> => {
  return internalClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
};

export const verifyOtpAction = async (data: VerifyOtpInput): Promise<VerifyOtpResponse> => {
  return internalClient.post<VerifyOtpResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
};

export const resendOtpAction = async (data: ResendOtpInput): Promise<ResendOtpResponse> => {
  return internalClient.post<ResendOtpResponse>(API_ENDPOINTS.AUTH.RESEND_OTP, data);
};

export const forgotPasswordAction = async (data: ForgotPasswordInput): Promise<ForgotPasswordResponse> => {
  return internalClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
};

export const resetPasswordAction = async (data: ResetPasswordInput): Promise<ResetPasswordResponse> => {
  return internalClient.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
};

export const getProfileAction = async (): Promise<GetProfileResponse> => {
  return internalClient.get<GetProfileResponse>(API_ENDPOINTS.USER.PROFILE);
};

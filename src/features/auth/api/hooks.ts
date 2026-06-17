import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { USER_ROLES } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { formatPhone } from '../utils/phone';
import {
  forgotPasswordAction,
  loginAction,
  resendOtpAction,
  resetPasswordAction,
  signupAction,
  verifyOtpAction,
} from './actions';
import {
  ForgotPasswordInput,
  LoginInput,
  ResendOtpInput,
  ResetPasswordInput,
  SignupInput,
  VerifyOtpInput,
} from './types';

export const useSignup = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (variables: SignupInput) =>
      signupAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: (res, variables) => {
      if (res.otp) {
        alert(`OTP Code: ${res.otp}`);
      }
      router.push({
        pathname: ROUTES.auth.otpVerification,
        params: { phone: formatPhone(variables.phone), flow: 'signup', role: variables.role },
      });
    },
  });
};

export const useLogin = () => {
  const { login } = useAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (variables: LoginInput) =>
      loginAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: async (res) => {
      await login(res.user, res.access_token);
      const role = res.user.current_role || res.user.role;
      if (role === USER_ROLES.Provider) {
        router.replace(ROUTES.provider.home);
      } else {
        router.replace(ROUTES.customer.home);
      }
    },
    onError: (err: any, variables) => {
      if (err.status === 403 && err.details?.user) {
        alert(err.message || 'Phone number not verified. Redirecting to OTP verification.');
        router.push({
          pathname: ROUTES.auth.otpVerification,
          params: { phone: formatPhone(variables.phone), flow: 'signup', role: err.details.user.role },
        });
      }
    },
  });
};

export const useVerifyOtp = () => {
  const { login } = useAuth();
  const router = useRouter();
  return useMutation({
    mutationFn: (variables: VerifyOtpInput) =>
      verifyOtpAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: async (res, variables) => {
      alert('OTP verified successfully!');
      if (variables.type === 'reset_password') {
        router.replace({
          pathname: ROUTES.auth.resetPassword,
          params: { phone: formatPhone(variables.phone), otp: variables.otp },
        });
      } else {
        if (res.user && res.access_token) {
          await login(res.user, res.access_token);
        }
        const userRole = res.user?.current_role || res.user?.role || 'customer';
        router.replace({
          pathname: ROUTES.auth.gettingStarted as any,
          params: { role: userRole, phone: formatPhone(variables.phone) },
        });
      }
    },
  });
};

export const useResendOtp = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (variables: ResendOtpInput) =>
      resendOtpAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: (res) => {
      if (res.otp) {
        alert(`OTP Code: ${res.otp}`);
      }
      alert('A new OTP has been sent successfully!');
      onSuccess?.();
    },
  });
};

export const useForgotPassword = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (variables: ForgotPasswordInput) =>
      forgotPasswordAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: (res, variables) => {
      if (res.otp) {
        alert(`OTP Code: ${res.otp}`);
      }
      router.push({
        pathname: ROUTES.auth.otpVerification,
        params: { phone: formatPhone(variables.phone), flow: 'forgot-password' },
      });
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (variables: ResetPasswordInput) =>
      resetPasswordAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: () => {
      alert('Password reset successfully!');
      router.replace(ROUTES.auth.signin);
    },
  });
};

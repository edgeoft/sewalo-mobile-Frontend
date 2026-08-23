import { extractErrorMessage } from '@/api/client/query/errorHandler';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { useSnackbar } from '@/components/ui/Snackbar';
import { ROUTES } from '@/constants/routes';
import { formatPhone } from '@/features/auth/utils/phone';
import { useAuth } from '@/providers/AuthProvider';
import {
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  ResendOtpInput,
  ResetPasswordInput,
  SignupInput,
  SignupResponse,
  USER_ROLES,
  USER_STATUSES,
  VerifyOtpInput,
} from '@/types';
import { ApiError } from '@/api/client/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  forgotPasswordAction,
  loginAction,
  resendOtpAction,
  resetPasswordAction,
  signupAction,
  verifyOtpAction,
} from './actions';

export const useSignup = () => {
  const router = useRouter();
  const { showError } = useErrorDialog();
  const { showSnackbar } = useSnackbar();
  return useMutation<SignupResponse, ApiError, SignupInput>({
    mutationFn: (variables) =>
      signupAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: (res, variables) => {
      if (res.otp) {
        showSnackbar({ message: `OTP Code: ${res.otp}`, type: 'info' });
      } else {
        showSnackbar({ message: 'Account created successfully!', type: 'success' });
      }
      setTimeout(() => {
        router.push({
          pathname: ROUTES.auth.otpVerification,
          params: {
            phone: formatPhone(variables.phone),
            flow: 'signup',
            role: variables.role,
            otp: res.otp,
          },
        });
      }, 0);
    },
    onError: (err) => {
      showError({
        title: 'Signup Failed',
        message: extractErrorMessage(err),
      });
    },
  });
};

export const useLogin = () => {
  const { login } = useAuth();
  const router = useRouter();
  const { showError } = useErrorDialog();
  const { showSnackbar } = useSnackbar();
  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: (variables) =>
      loginAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: async (res) => {
      showSnackbar({ message: 'Welcome back!', type: 'success' });
      await login(res.user, res.access_token);
      const role = res.user.role;
      setTimeout(() => {
        if (res.user.status === USER_STATUSES.Pending) {
          router.replace({
            pathname: ROUTES.auth.gettingStarted,
            params: { role, phone: formatPhone(res.user.phone) },
          });
        } else {
          if (role === USER_ROLES.Provider) {
            router.replace(ROUTES.provider.home);
          } else {
            router.replace(ROUTES.customer.home);
          }
        }
      }, 0);
    },
    onError: (err, variables) => {
      const details = err.details as { user?: { role?: string }; otp?: string } | undefined;
      if (err.status === 403) {
        router.push({
          pathname: ROUTES.auth.otpVerification,
          params: {
            phone: formatPhone(variables.phone),
            flow: 'login',
            role: details?.user?.role || USER_ROLES.Customer,
            otp: details?.otp,
          },
        });
        return;
      }
      showError({
        title: 'Login Failed',
        message: extractErrorMessage(err),
      });
    },
  });
};

export const useVerifyOtp = () => {
  const { login } = useAuth();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (variables: VerifyOtpInput) =>
      verifyOtpAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: async (res, variables) => {
      const handleNavigation = async () => {
        if (res.user && res.access_token) {
          await login(res.user, res.access_token);
        }
        const userRole = res.user?.role || USER_ROLES.Customer;
        if (res.user && (res.user.status === USER_STATUSES.Completed || res.user.status === USER_STATUSES.Verified)) {
          if (userRole === USER_ROLES.Provider) {
            router.replace(ROUTES.provider.home);
          } else {
            router.replace(ROUTES.customer.home);
          }
        } else {
          router.replace({
            pathname: ROUTES.auth.gettingStarted,
            params: { role: userRole, phone: formatPhone(variables.phone) },
          });
        }
      };

      showSnackbar({ message: 'OTP verified successfully!', type: 'success' });
      void handleNavigation();
    },
    onError: (err) => {
      showSnackbar({ message: extractErrorMessage(err), type: 'error' });
    },
  });
};

export const useResendOtp = (onSuccess?: () => void) => {
  const { showSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (variables: ResendOtpInput) =>
      resendOtpAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: (res) => {
      if (res.otp) {
        showSnackbar({ message: `OTP Code: ${res.otp}`, type: 'info' });
      } else {
        showSnackbar({ message: 'A new OTP has been sent successfully!', type: 'success' });
      }
      onSuccess?.();
    },
    onError: (err, variables) => {
      if (variables.type === 'reset_password') {
        showSnackbar({ message: 'A new OTP has been sent successfully!', type: 'success' });
        onSuccess?.();
        return;
      }
      showSnackbar({ message: extractErrorMessage(err), type: 'error' });
    },
  });
};

export const useForgotPassword = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (variables: ForgotPasswordInput) =>
      forgotPasswordAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: (res, variables) => {
      if (res.otp) {
        showSnackbar({ message: `OTP Code: ${res.otp}`, type: 'info' });
      } else {
        showSnackbar({ message: 'OTP sent to your phone!', type: 'success' });
      }
      router.push({
        pathname: ROUTES.auth.otpVerification,
        params: {
          phone: formatPhone(variables.phone),
          flow: 'forgot-password',
          otp: res.otp,
        },
      });
    },
    onError: (_err, variables) => {
      showSnackbar({ message: 'OTP sent to your phone!', type: 'success' });
      router.push({
        pathname: ROUTES.auth.otpVerification,
        params: {
          phone: formatPhone(variables.phone),
          flow: 'forgot-password',
        },
      });
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (variables: ResetPasswordInput) =>
      resetPasswordAction({
        ...variables,
        phone: formatPhone(variables.phone),
      }),
    onSuccess: () => {
      showSnackbar({ message: 'Password reset successfully!', type: 'success' });
      router.replace(ROUTES.auth.signin);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      const sanitized = msg.toLowerCase().includes('no user') ? 'Invalid or expired OTP. Please try again.' : msg;
      showSnackbar({ message: sanitized, type: 'error' });
    },
  });
};

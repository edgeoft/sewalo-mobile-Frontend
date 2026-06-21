import { useAuth } from '@/providers/AuthProvider';

export type UserStatus = 'pending' | 'completed' | 'verified' | 'rejected' | 'suspended';

type VerificationStatusResult = {
  isVerified: boolean;
  isPending: boolean;
  isCompleted: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  hasMissingId: boolean;
  isProfileCompleted: boolean;
  status: UserStatus | null;
  canPerformActions: boolean;
  getMessage: () => string;
};

const MESSAGES: Record<UserStatus, string> = {
  pending: 'Your profile is incomplete. Please finish onboarding.',
  completed: 'Your document is under review. Please wait for approval.',
  verified: 'Your identity has been verified.',
  rejected: 'Your verification was rejected.',
  suspended: 'Your account is currently suspended.',
};

export const useVerificationStatus = (): VerificationStatusResult => {
  const { user } = useAuth();
  const status = (user?.status as UserStatus) ?? null;

  const isProvider = user?.current_role === 'provider' || user?.role === 'provider';
  const isCustomer = user?.current_role === 'customer' || user?.role === 'customer';
  const hasMissingId = isProvider && !!user && !user.document;

  const getMessage = (): string => {
    if (!user) return 'Not logged in';
    // If customer and no specific status message, don't show generic status messages unless rejected/suspended
    if (isCustomer && !user.status_message && status !== 'rejected' && status !== 'suspended') {
      return '';
    }

    if (user.status_message) return user.status_message;

    if (hasMissingId) return 'Please upload your identity document.';
    if (status && MESSAGES[status]) return MESSAGES[status];
    return 'Please complete your profile.';
  };

  const isVerified = status === 'verified';
  const isCompleted = status === 'completed';
  const canPerformActions = isCustomer ? isVerified || isCompleted : isVerified;

  return {
    isVerified,
    isPending: status === 'pending',
    isCompleted,
    isRejected: status === 'rejected',
    isSuspended: status === 'suspended',
    hasMissingId,
    isProfileCompleted: !!user && status !== 'pending' && status !== null,
    status,
    canPerformActions,
    getMessage,
  };
};

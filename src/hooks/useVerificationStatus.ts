import { useAuth } from '@/providers/AuthProvider';
import { USER_ROLES, USER_STATUSES } from '@/types';

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
  const { user, role: authRole } = useAuth();
  const status = (user?.status as UserStatus) ?? null;

  const currentRole = authRole || user?.role || USER_ROLES.Customer;
  const isProvider = currentRole === USER_ROLES.Provider;
  const isCustomer = !isProvider;
  const hasMissingId = isProvider && !!user && !user.document;

  const getMessage = (): string => {
    if (!user) return 'Not logged in';
    // If customer and no specific status message, don't show generic status messages unless rejected/suspended
    if (isCustomer && !user.status_message && status !== USER_STATUSES.Rejected && status !== USER_STATUSES.Suspended) {
      return '';
    }

    if (user.status_message) return user.status_message;

    if (hasMissingId) return 'Please upload your identity document.';
    if (status && MESSAGES[status]) return MESSAGES[status];
    return 'Please complete your profile.';
  };

  const isVerified = status === USER_STATUSES.Verified;
  const isCompleted = status === USER_STATUSES.Completed;
  const canPerformActions = isCustomer ? isVerified || isCompleted : isVerified;

  return {
    isVerified,
    isPending: status === USER_STATUSES.Pending,
    isCompleted,
    isRejected: status === USER_STATUSES.Rejected,
    isSuspended: status === USER_STATUSES.Suspended,
    hasMissingId,
    isProfileCompleted: !!user && status !== USER_STATUSES.Pending && status !== null,
    status,
    canPerformActions,
    getMessage,
  };
};

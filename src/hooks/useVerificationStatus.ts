import { useAuth } from '@/providers/AuthProvider';
import { USER_ROLES, USER_STATUSES, UserStatus } from '@/types';

type VerificationStatusResult = {
  isVerified: boolean;
  isPending: boolean;
  isCompleted: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  hasMissingId: boolean;
  status: UserStatus | null;
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
  const rawStatus = user?.status;
  const status: UserStatus | null =
    rawStatus && Object.values(USER_STATUSES).includes(rawStatus as UserStatus) ? (rawStatus as UserStatus) : null;

  const currentRole = authRole || user?.role || USER_ROLES.Customer;
  const isProvider = currentRole === USER_ROLES.Provider;
  const hasMissingId = isProvider && !!user && !user.document;

  const getMessage = (): string => {
    if (!user) return 'Not logged in';
    if (user.status_message) return user.status_message;

    if (hasMissingId) return 'Please upload your identity document.';
    if (status && MESSAGES[status]) return MESSAGES[status];
    return 'Please complete your profile.';
  };

  const isVerified = status === USER_STATUSES.Verified;
  const isCompleted = status === USER_STATUSES.Completed;

  return {
    isVerified,
    isPending: status === USER_STATUSES.Pending,
    isCompleted,
    isRejected: status === USER_STATUSES.Rejected,
    isSuspended: status === USER_STATUSES.Suspended,
    hasMissingId,
    status,
    getMessage,
  };
};

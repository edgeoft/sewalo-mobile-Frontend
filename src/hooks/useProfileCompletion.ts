import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useGetFinanceAccountsQuery } from '@/api';

export interface CompletionItem {
  key: string;
  label: string;
  isComplete: boolean;
  actionRoute?: string;
  promptMessage: string;
}

export interface ProfileCompletionResult {
  percentage: number;
  completedCount: number;
  totalCount: number;
  items: CompletionItem[];
  topPrompt: string;
  isFullyComplete: boolean;
}

export function useProfileCompletion(): ProfileCompletionResult {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  // Fetch payout accounts to evaluate financial details
  const { data: accountsResponse } = useGetFinanceAccountsQuery();
  const payoutAccounts = accountsResponse?.data || [];
  const hasPayoutAccounts = payoutAccounts.length > 0;

  return useMemo(() => {
    if (!user) {
      return {
        percentage: 0,
        completedCount: 0,
        totalCount: 8,
        items: [],
        topPrompt: 'Complete your profile to unlock all platform features.',
        isFullyComplete: false,
      };
    }

    if (role === 'provider') {
      const items: CompletionItem[] = [
        {
          key: 'avatar',
          label: 'Profile Photo',
          isComplete: Boolean(user.avatar),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Upload a profile photo to build trust with customers.',
        },
        {
          key: 'contact',
          label: 'Contact Information',
          isComplete: Boolean(user.phone && user.email),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Provide your email address and mobile number.',
        },
        {
          key: 'address',
          label: 'Location / Address',
          isComplete: Boolean(user.address || user.city),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Set your primary service area to receive local requests.',
        },
        {
          key: 'availability',
          label: 'Availability Schedule',
          isComplete: Boolean(user.availability || (user.start_time && user.end_time)),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Set your working hours so customers know when to book.',
        },
        {
          key: 'education',
          label: 'Skills & Education',
          isComplete: Boolean(user.education && user.education.length > 0),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Add your education & credentials to showcase your expertise.',
        },
        {
          key: 'experience',
          label: 'Work Experience',
          isComplete: Boolean(user.experience && user.experience.length > 0),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Add your experience to attract more bookings.',
        },
        {
          key: 'finance',
          label: 'Financial Details',
          isComplete: hasPayoutAccounts,
          actionRoute: '/provider/payout-accounts',
          promptMessage: 'Complete your financial details to receive payouts.',
        },
        {
          key: 'document',
          label: 'Identity Verification',
          isComplete: Boolean(user.document),
          actionRoute: '/provider/edit-profile',
          promptMessage: 'Verify your identity to earn a trusted provider badge.',
        },
      ];

      const completedCount = items.filter((item) => item.isComplete).length;
      const totalCount = items.length;
      const percentage = Math.round((completedCount / totalCount) * 100);
      const incompleteItem = items.find((item) => !item.isComplete);

      const topPrompt = incompleteItem
        ? incompleteItem.promptMessage
        : 'Your profile is 100% complete! Great job building trust with customers.';

      return {
        percentage,
        completedCount,
        totalCount,
        items,
        topPrompt,
        isFullyComplete: percentage === 100,
      };
    } else {
      // Customer Role
      const items: CompletionItem[] = [
        {
          key: 'avatar',
          label: 'Profile Photo',
          isComplete: Boolean(user.avatar),
          actionRoute: '/customer/edit-profile',
          promptMessage: 'Add a profile photo so service providers recognize you.',
        },
        {
          key: 'contact',
          label: 'Contact Information',
          isComplete: Boolean(user.phone && user.email),
          actionRoute: '/customer/edit-profile',
          promptMessage: 'Complete your contact details for booking notifications.',
        },
        {
          key: 'address',
          label: 'Primary Address',
          isComplete: Boolean(user.address || user.city),
          actionRoute: '/customer/edit-profile',
          promptMessage: 'Set your primary address for faster service bookings.',
        },
        {
          key: 'document',
          label: 'Identity Verification',
          isComplete: Boolean(user.document),
          actionRoute: '/customer/edit-profile',
          promptMessage: 'Verify your identity to earn trusted customer status.',
        },
      ];

      const completedCount = items.filter((item) => item.isComplete).length;
      const totalCount = items.length;
      const percentage = Math.round((completedCount / totalCount) * 100);
      const incompleteItem = items.find((item) => !item.isComplete);

      const topPrompt = incompleteItem
        ? incompleteItem.promptMessage
        : 'Your profile is 100% complete! You are ready to book any service.';

      return {
        percentage,
        completedCount,
        totalCount,
        items,
        topPrompt,
        isFullyComplete: percentage === 100,
      };
    }
  }, [user, role, hasPayoutAccounts]);
}

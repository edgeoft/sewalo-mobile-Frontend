import { useMemo } from 'react';
import type { Href } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useGetFinanceAccountsQuery } from '@/api';
import { USER_ROLES } from '@/types';

export interface CompletionItem {
  key: string;
  label: string;
  isComplete: boolean;
  actionRoute?: Href;
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
  const { user, role: authRole } = useAuth();
  const role = authRole || user?.role || USER_ROLES.Customer;

  // Fetch payout accounts to evaluate financial details only for providers
  const isProvider = role === USER_ROLES.Provider;
  const { data: accountsResponse } = useGetFinanceAccountsQuery(isProvider);
  const payoutAccounts = isProvider ? accountsResponse?.data || [] : [];
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

    if (role === USER_ROLES.Provider) {
      const items: CompletionItem[] = [
        {
          key: 'avatar',
          label: 'Profile Photo',
          isComplete: Boolean(user.avatar),
          actionRoute: { pathname: '/provider/edit-profile', params: { section: 'avatar' } },
          promptMessage: 'Your profile is missing a photo. Upload one to build trust with potential clients.',
        },
        {
          key: 'contact',
          label: 'Contact Information',
          isComplete: Boolean(user.phone && user.email),
          actionRoute: { pathname: '/provider/edit-profile', params: { section: 'contact' } },
          promptMessage: 'Your profile is missing contact info to receive direct booking updates and client calls.',
        },
        {
          key: 'address',
          label: 'Location / Address',
          isComplete: Boolean(user.address || user.city),
          actionRoute: { pathname: '/provider/edit-profile', params: { section: 'address' } },
          promptMessage: 'Your profile is missing a service area. Set your location to receive local job requests.',
        },
        {
          key: 'availability',
          label: 'Availability Schedule',
          isComplete: Boolean(user.availability || (user.start_time && user.end_time)),
          actionRoute: { pathname: '/provider/edit-profile', params: { section: 'availability' } },
          promptMessage: 'Your profile is missing working hours. Set your schedule so clients know when to book you.',
        },
        {
          key: 'education',
          label: 'Skills & Education',
          isComplete: Boolean(user.education && user.education.length > 0),
          actionRoute: { pathname: '/provider/edit-profile', params: { section: 'skills' } },
          promptMessage: 'Your profile is missing credentials. Add skills & education to highlight your expertise.',
        },
        {
          key: 'experience',
          label: 'Work Experience',
          isComplete: Boolean(user.experience && user.experience.length > 0),
          actionRoute: { pathname: '/provider/edit-profile', params: { section: 'skills' } },
          promptMessage: 'Your profile is missing work history. Add your experience to attract more bookings.',
        },
        {
          key: 'finance',
          label: 'Financial Details',
          isComplete: hasPayoutAccounts,
          actionRoute: '/provider/payout-accounts',
          promptMessage:
            'Your profile is missing payout account details. Set up your bank account to receive earnings.',
        },
        {
          key: 'document',
          label: 'Identity Verification',
          isComplete: Boolean(user.document),
          actionRoute: '/provider/verification-documents',
          promptMessage: 'Your profile is missing identity verification. Submit your ID for a verified partner badge.',
        },
      ];

      const completedCount = items.filter((item) => item.isComplete).length;
      const totalCount = items.length;
      const percentage = Math.round((completedCount / totalCount) * 100);

      const topPrompt =
        percentage === 100
          ? 'Your profile is 100% complete! You are fully eligible to receive client requests.'
          : 'Your profile is missing some details. Complete them to increase your visibility and customer trust.';

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
          actionRoute: { pathname: '/customer/edit-profile', params: { section: 'avatar' } },
          promptMessage: 'Your profile is missing a photo. Upload one so service professionals recognize you.',
        },
        {
          key: 'contact',
          label: 'Contact Information',
          isComplete: Boolean(user.phone && user.email),
          actionRoute: { pathname: '/customer/edit-profile', params: { section: 'contact' } },
          promptMessage: 'Your profile is missing contact details to receive instant booking notifications.',
        },
        {
          key: 'address',
          label: 'Primary Address',
          isComplete: Boolean(user.address || user.city),
          actionRoute: { pathname: '/customer/edit-profile', params: { section: 'address' } },
          promptMessage: 'Your profile is missing a primary address. Set it to request services faster.',
        },
        {
          key: 'document',
          label: 'Identity Verification',
          isComplete: Boolean(user.document),
          actionRoute: '/customer/identity-verification',
          promptMessage: 'Your profile is missing identity verification. Submit your ID for trusted status.',
        },
      ];

      const completedCount = items.filter((item) => item.isComplete).length;
      const totalCount = items.length;
      const percentage = Math.round((completedCount / totalCount) * 100);

      const topPrompt =
        percentage === 100
          ? 'Your profile is 100% complete! You are ready to book any service.'
          : 'Your profile is missing some details. Complete them for faster service bookings.';

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

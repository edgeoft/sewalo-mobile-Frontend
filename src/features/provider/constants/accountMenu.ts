import { Feather } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { UserProfile } from '@/types';

export interface AccountMenuItemOption {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  route?: string;
  destructive?: boolean;
}

export interface AccountMenuSection {
  id: string;
  title: string;
  items: AccountMenuItemOption[];
}

export function getProviderAccountMenu(t: TFunction, user: UserProfile | null): AccountMenuSection[] {
  return [
    {
      id: 'account',
      title: t('navigation.account'),
      items: [
        {
          id: 'edit-profile',
          icon: 'user',
          title: t('navigation.editProfile'),
          subtitle: t('navigation.editProfileSubtitle'),
        },
        {
          id: 'switch-role',
          icon: 'repeat',
          title: 'Switch to Customer',
          subtitle: 'Switch to your customer profile',
        },
        {
          id: 'payout-accounts',
          icon: 'dollar-sign',
          title: t('provider.payoutAccounts'),
          subtitle: t('provider.payoutAccounts'),
        },
        {
          id: 'verification-documents',
          icon: 'file-text',
          title: t('provider.verificationDocuments'),
          subtitle: t('provider.verificationDocuments'),
        },
        {
          id: 'my-reviews',
          icon: 'star',
          title: t('customer.myReviews'),
          subtitle: t('customer.myReviews'),
        },
      ],
    },
    {
      id: 'preferences',
      title: t('navigation.preferences'),
      items: [
        {
          id: 'language',
          icon: 'globe',
          title: t('navigation.language'),
          subtitle: t('navigation.language'),
        },
        {
          id: 'notification-settings',
          icon: 'bell',
          title: t('settings.notificationSettingsTitle'),
          subtitle: t('navigation.notificationSettingsSubtitle'),
        },
        {
          id: 'privacy-settings',
          icon: 'shield',
          title: t('settings.privacySettingsTitle'),
          subtitle: t('navigation.privacySettingsSubtitle'),
        },
        {
          id: 'change-password',
          icon: 'lock',
          title: t('navigation.changePassword'),
          subtitle: t('navigation.changePasswordSubtitle'),
        },
      ],
    },
    {
      id: 'support-and-info',
      title: t('navigation.supportAndInfo'),
      items: [
        {
          id: 'help-faq',
          icon: 'help-circle',
          title: t('settings.helpFaqTitle'),
          subtitle: t('navigation.helpAndFaqSubtitle'),
        },
        {
          id: 'contact-support',
          icon: 'message-circle',
          title: t('settings.contactSupportTitle'),
          subtitle: t('navigation.contactSupportSubtitle'),
        },
        {
          id: 'terms-of-service',
          icon: 'file-text',
          title: t('navigation.termsAndConditions'),
          subtitle: t('navigation.termsAndConditionsSubtitle'),
        },
        {
          id: 'privacy-policy',
          icon: 'shield',
          title: t('navigation.privacyPolicy'),
          subtitle: t('navigation.privacyPolicySubtitle'),
        },
        {
          id: 'rate-app',
          icon: 'star',
          title: t('settings.rateAppTitle'),
          subtitle: t('navigation.rateAppSubtitle'),
        },
      ],
    },
    {
      id: 'actions',
      title: t('navigation.actions'),
      items: [
        {
          id: 'logout',
          icon: 'log-out',
          title: t('navigation.logout'),
          subtitle: t('navigation.logout'),
          destructive: true,
        },
      ],
    },
  ];
}

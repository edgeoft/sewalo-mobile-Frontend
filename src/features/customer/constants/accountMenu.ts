import type { TFunction } from 'i18next';
import { UserProfile, AccountMenuSection } from '@/types';
import { ROUTES } from '@/constants/routes';

export function getCustomerAccountMenu(t: TFunction, user: UserProfile | null): AccountMenuSection[] {
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
          route: ROUTES.customer.editProfile,
        },
        {
          id: 'switch-role',
          icon: 'repeat',
          title: 'Switch to Provider',
          subtitle: 'Switch to provider to start taking bookings',
        },
        {
          id: 'my-reviews',
          icon: 'star',
          title: t('customer.myReviews'),
          subtitle: t('customer.myReviews'),
          route: ROUTES.customer.myReviews,
        },
        {
          id: 'identity-verification',
          icon: 'file-text',
          title: t('customer.identityVerification'),
          subtitle: t('customer.identityVerification'),
          route: ROUTES.customer.identityVerification,
        },
        {
          id: 'refer-friend',
          icon: 'users',
          title: t('customer.referTitle'),
          subtitle: t('navigation.referFriendSubtitle'),
          route: ROUTES.customer.referFriend,
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
        // {
        //   id: 'notification-settings',
        //   icon: 'bell',
        //   title: t('settings.notificationSettingsTitle'),
        //   subtitle: t('navigation.notificationSettingsSubtitle'),
        //   route: ROUTES.customer.notificationSettings,
        // },
        // {
        //   id: 'privacy-settings',
        //   icon: 'shield',
        //   title: t('settings.privacySettingsTitle'),
        //   subtitle: t('navigation.privacySettingsSubtitle'),
        //   route: ROUTES.customer.privacySettings,
        // },
        {
          id: 'change-password',
          icon: 'lock',
          title: t('navigation.changePassword'),
          subtitle: t('navigation.changePasswordSubtitle'),
          route: ROUTES.customer.changePassword,
        },
      ],
    },
    {
      id: 'support-and-info',
      title: t('navigation.supportAndInfo'),
      items: [
        // {
        //   id: 'help-faq',
        //   icon: 'help-circle',
        //   title: t('settings.helpFaqTitle'),
        //   subtitle: t('navigation.helpAndFaqSubtitle'),
        //   route: ROUTES.customer.helpFaq,
        // },
        {
          id: 'contact-support',
          icon: 'message-circle',
          title: t('settings.contactSupportTitle'),
          subtitle: t('navigation.contactSupportSubtitle'),
          route: ROUTES.customer.contactSupport,
        },
        {
          id: 'terms-of-service',
          icon: 'file-text',
          title: t('navigation.termsAndConditions'),
          subtitle: t('navigation.termsAndConditionsSubtitle'),
          route: ROUTES.customer.termsOfService,
        },
        {
          id: 'privacy-policy',
          icon: 'shield',
          title: t('navigation.privacyPolicy'),
          subtitle: t('navigation.privacyPolicySubtitle'),
          route: ROUTES.customer.privacyPolicy,
        },
        {
          id: 'rate-app',
          icon: 'star',
          title: t('settings.rateAppTitle'),
          subtitle: t('navigation.rateAppSubtitle'),
          route: ROUTES.customer.rateApp,
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

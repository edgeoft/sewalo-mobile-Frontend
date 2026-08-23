import type { TFunction } from 'i18next';
import { UserProfile, AccountMenuSection } from '@/types';
import { ROUTES } from '@/constants/routes';

type AccountRole = 'customer' | 'provider';

/**
 * Single source for account-screen menus. The customer/provider variants differ
 * only by route namespace, the switch-role copy, and two role-specific entries.
 */
export function buildAccountMenu(t: TFunction, user: UserProfile | null, role: AccountRole): AccountMenuSection[] {
  const routes = ROUTES[role];

  const accountItems: AccountMenuSection['items'] = [
    {
      id: 'edit-profile',
      icon: 'user',
      title: t('navigation.editProfile'),
      subtitle: t('navigation.editProfileSubtitle'),
      route: routes.editProfile,
    },
    {
      id: 'switch-role',
      icon: 'repeat',
      title: role === 'customer' ? 'Switch to Provider' : 'Switch to Customer',
      subtitle: role === 'customer' ? 'Switch to provider to start taking bookings' : 'Switch to your customer profile',
    },
  ];

  if (role === 'customer') {
    accountItems.push(
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
    );
  } else {
    accountItems.push(
      {
        id: 'payout-accounts',
        icon: 'dollar-sign',
        title: t('provider.payoutAccounts'),
        subtitle: t('provider.payoutAccounts'),
        route: ROUTES.provider.payoutAccounts,
      },
      {
        id: 'verification-documents',
        icon: 'file-text',
        title: t('provider.verificationDocuments'),
        subtitle: t('provider.verificationDocuments'),
        route: ROUTES.provider.verificationDocuments,
      },
      {
        id: 'my-reviews',
        icon: 'star',
        title: t('customer.myReviews'),
        subtitle: t('customer.myReviews'),
        route: ROUTES.provider.myReviews,
      },
    );
  }

  return [
    {
      id: 'account',
      title: t('navigation.account'),
      items: accountItems,
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
          id: 'change-password',
          icon: 'lock',
          title: t('navigation.changePassword'),
          subtitle: t('navigation.changePasswordSubtitle'),
          route: routes.changePassword,
        },
      ],
    },
    {
      id: 'support-and-info',
      title: t('navigation.supportAndInfo'),
      items: [
        {
          id: 'contact-support',
          icon: 'message-circle',
          title: t('settings.contactSupportTitle'),
          subtitle: t('navigation.contactSupportSubtitle'),
          route: routes.contactSupport,
        },
        {
          id: 'terms-of-service',
          icon: 'file-text',
          title: t('navigation.termsAndConditions'),
          subtitle: t('navigation.termsAndConditionsSubtitle'),
          route: routes.termsOfService,
        },
        {
          id: 'privacy-policy',
          icon: 'shield',
          title: t('navigation.privacyPolicy'),
          subtitle: t('navigation.privacyPolicySubtitle'),
          route: routes.privacyPolicy,
        },
        {
          id: 'rate-app',
          icon: 'star',
          title: t('settings.rateAppTitle'),
          subtitle: t('navigation.rateAppSubtitle'),
          route: routes.rateApp,
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

export function getCustomerAccountMenu(t: TFunction, user: UserProfile | null): AccountMenuSection[] {
  return buildAccountMenu(t, user, 'customer');
}

export function getProviderAccountMenu(t: TFunction, user: UserProfile | null): AccountMenuSection[] {
  return buildAccountMenu(t, user, 'provider');
}

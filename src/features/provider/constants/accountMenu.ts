import { Feather } from '@expo/vector-icons';

export interface AccountMenuItemOption {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  route?: string;
  destructive?: boolean;
}

export interface AccountMenuSection {
  title: string;
  items: AccountMenuItemOption[];
}

export const PROVIDER_ACCOUNT_MENU: AccountMenuSection[] = [
  {
    title: 'Account',
    items: [
      {
        id: 'edit-profile',
        icon: 'user',
        title: 'Edit Profile',
        subtitle: 'Update personal info and profile picture',
      },
      {
        id: 'payout-accounts',
        icon: 'dollar-sign',
        title: 'Payout Accounts',
        subtitle: 'Manage bank accounts and digital wallets for payout',
      },
      {
        id: 'verification-documents',
        icon: 'file-text',
        title: 'Verification Documents',
        subtitle: 'Upload ID and business certificates for verified partner status',
      },
      {
        id: 'my-reviews',
        icon: 'star',
        title: 'My Reviews',
        subtitle: 'See what your customers are saying',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'language',
        icon: 'globe',
        title: 'Language',
        subtitle: 'Select app locale',
      },
      {
        id: 'notification-settings',
        icon: 'bell',
        title: 'Notification Settings',
        subtitle: 'Configure service booking notifications and sounds',
      },
      {
        id: 'privacy-settings',
        icon: 'shield',
        title: 'Privacy Settings',
        subtitle: 'Control account visibility and data sharing preferences',
      },
      {
        id: 'change-password',
        icon: 'lock',
        title: 'Change Password',
        subtitle: 'Secure partner portal credentials',
      },
    ],
  },
  {
    title: 'Support & Info',
    items: [
      {
        id: 'help-faq',
        icon: 'help-circle',
        title: 'Help & FAQ',
        subtitle: 'Browse how-to tutorials and quick answers',
      },
      {
        id: 'contact-support',
        icon: 'message-circle',
        title: 'Contact Support',
        subtitle: 'Connect to live chat or submit requests',
      },
      {
        id: 'terms-of-service',
        icon: 'file-text',
        title: 'Terms of Service',
        subtitle: 'Read our user agreement and guidelines',
      },
      {
        id: 'privacy-policy',
        icon: 'shield',
        title: 'Privacy Policy',
        subtitle: 'View how we safeguard your personal details',
      },
      {
        id: 'rate-app',
        icon: 'star',
        title: 'Rate the App',
        subtitle: 'Share your feedback on the App Store',
      },
    ],
  },
  {
    title: 'Actions',
    items: [
      {
        id: 'logout',
        icon: 'log-out',
        title: 'Log Out',
        subtitle: 'Safely sign out of your partner portal session',
        destructive: true,
      },
    ],
  },
];

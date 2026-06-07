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

export const CUSTOMER_ACCOUNT_MENU: AccountMenuSection[] = [
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
        id: 'my-reviews',
        icon: 'star',
        title: 'My Reviews',
        subtitle: 'View and manage reviews you have written',
      },
      {
        id: 'identity-verification',
        icon: 'file-text',
        title: 'Identity Verification',
        subtitle: 'Upload government ID for account verification',
      },
      {
        id: 'refer-friend',
        icon: 'users',
        title: 'Refer a Friend',
        subtitle: 'Invite friends to Sewalo & get rewards',
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
        subtitle: 'Configure sound, banner, and email updates',
      },
      {
        id: 'privacy-settings',
        icon: 'shield',
        title: 'Privacy Settings',
        subtitle: 'Manage account visibility and data preferences',
      },
      {
        id: 'change-password',
        icon: 'lock',
        title: 'Change Password',
        subtitle: 'Secure your account access',
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
        subtitle: 'Safely sign out of your current session',
        destructive: true,
      },
    ],
  },
];

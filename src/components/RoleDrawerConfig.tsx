import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';

import { SideDrawerFooterAction, SideDrawerSection } from './SideDrawer';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface DrawerActionDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: FeatherIconName;
  color?: string;
}

interface CreateRoleDrawerConfigArgs {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onActionPress?: (actionId: string) => void;
  onLogout: () => void;
}

interface CreateGuestDrawerConfigArgs {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onActionPress?: (actionId: string) => void;
}

const brandColor = '#485aff';
const warningColor = '#f59e0b';

const roleSections: { title: string; items: DrawerActionDefinition[] }[] = [
  {
    title: 'Account & Profile',
    items: [
      {
        id: 'edit-profile',
        title: 'Edit profile',
        subtitle: 'Update your name, photo and contact details',
        icon: 'user',
      },
      {
        id: 'change-password',
        title: 'Change password',
        subtitle: 'Keep your account secure',
        icon: 'lock',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'notification-settings',
        title: 'Notification settings',
        subtitle: 'Manage app alerts and updates',
        icon: 'bell',
      },
      {
        id: 'privacy-settings',
        title: 'Privacy settings',
        subtitle: 'Control visibility and data preferences',
        icon: 'shield',
      },
    ],
  },
  {
    title: 'Support & Info',
    items: [
      {
        id: 'help-faq',
        title: 'Help & FAQ',
        subtitle: 'Find answers to common questions',
        icon: 'help-circle',
      },
      {
        id: 'contact-support',
        title: 'Contact support',
        subtitle: 'Reach the Sewalo support team',
        icon: 'message-circle',
      },
      {
        id: 'report-problem',
        title: 'Report a problem',
        subtitle: 'Send an issue or bug report',
        icon: 'alert-triangle',
        color: warningColor,
      },
      {
        id: 'terms-conditions',
        title: 'Terms & conditions',
        subtitle: 'Review usage terms',
        icon: 'file',
      },
      {
        id: 'privacy-policy',
        title: 'Privacy policy',
        subtitle: 'Read how your data is handled',
        icon: 'lock',
      },
    ],
  },
  {
    title: 'Secondary actions',
    items: [
      {
        id: 'refer-friend',
        title: 'Refer a friend',
        subtitle: 'Invite others to Sewalo',
        icon: 'users',
      },
      {
        id: 'rate-app',
        title: 'Rate the app',
        subtitle: 'Share your feedback',
        icon: 'star',
        color: warningColor,
      },
      {
        id: 'about-sewalo',
        title: 'About Sewalo',
        subtitle: 'Learn more about the app',
        icon: 'info',
      },
    ],
  },
];

const guestSupportActions: DrawerActionDefinition[] = [
  {
    id: 'rate-app',
    title: 'Rate the app',
    subtitle: 'Share your feedback',
    icon: 'star',
    color: warningColor,
  },
  {
    id: 'about-sewalo',
    title: 'About Sewalo',
    subtitle: 'Learn more about the app',
    icon: 'info',
  },
  {
    id: 'privacy-policy',
    title: 'Privacy policy',
    subtitle: 'Read how your data is handled',
    icon: 'lock',
  },
  {
    id: 'terms-conditions',
    title: 'Terms & conditions',
    subtitle: 'Review usage terms',
    icon: 'file',
  },
  {
    id: 'report-problem',
    title: 'Report a problem',
    subtitle: 'Send an issue or bug report',
    icon: 'alert-triangle',
    color: warningColor,
  },
  {
    id: 'contact-support',
    title: 'Contact support',
    subtitle: 'Reach the Sewalo support team',
    icon: 'message-circle',
  },
];

function createActionItem(definition: DrawerActionDefinition, onActionPress?: (actionId: string) => void) {
  return {
    type: 'action' as const,
    id: definition.id,
    title: definition.title,
    subtitle: definition.subtitle,
    icon: <Feather name={definition.icon} size={18} color={definition.color ?? brandColor} />,
    onPress: () => onActionPress?.(definition.id),
  };
}

function createLanguageSection(
  currentLanguage: string,
  onLanguageChange: (code: string) => void,
  onActionPress?: (actionId: string) => void,
): SideDrawerSection {
  return {
    title: 'Preferences',
    items: [
      {
        type: 'language-toggle',
        id: 'language',
        title: 'Language',
        value: currentLanguage,
        onChange: (code: string) => {
          onLanguageChange(code);
          onActionPress?.('language');
        },
      },
    ],
  };
}

export function createRoleDrawerConfig({
  currentLanguage,
  onLanguageChange,
  onActionPress,
  onLogout,
}: CreateRoleDrawerConfigArgs): {
  sections: SideDrawerSection[];
  footerAction: SideDrawerFooterAction;
} {
  const sections = roleSections.map((section) => ({
    title: section.title,
    items:
      section.title === 'Preferences'
        ? [
            ...createLanguageSection(currentLanguage, onLanguageChange, onActionPress).items,
            ...section.items.map((item) => createActionItem(item, onActionPress)),
          ]
        : section.items.map((item) => createActionItem(item, onActionPress)),
  }));

  return {
    sections,
    footerAction: {
      label: 'Logout',
      onPress: onLogout,
      icon: <Feather name="log-out" size={18} color="#dc2626" />,
      destructive: true,
    },
  };
}

export function createGuestDrawerConfig({
  currentLanguage,
  onLanguageChange,
  onActionPress,
}: CreateGuestDrawerConfigArgs): {
  sections: SideDrawerSection[];
  footerAction?: SideDrawerFooterAction;
} {
  return {
    sections: [
      createLanguageSection(currentLanguage, onLanguageChange, onActionPress),
      {
        title: 'Support & Info',
        items: guestSupportActions.map((item) => createActionItem(item, onActionPress)),
      },
    ],
  };
}

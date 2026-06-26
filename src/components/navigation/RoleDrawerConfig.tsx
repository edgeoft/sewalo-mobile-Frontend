import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import type { TFunction } from 'i18next';

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

interface RoleSection {
  id: string;
  title: string;
  items: DrawerActionDefinition[];
}

function createRoleSections(t: TFunction): RoleSection[] {
  return [
    {
      id: 'account',
      title: t('navigation.accountAndProfile'),
      items: [
        {
          id: 'edit-profile',
          title: t('navigation.editProfile'),
          subtitle: t('navigation.editProfileSubtitle'),
          icon: 'user',
        },
        {
          id: 'change-password',
          title: t('navigation.changePassword'),
          subtitle: t('navigation.changePasswordSubtitle'),
          icon: 'lock',
        },
      ],
    },
    {
      id: 'preferences',
      title: t('navigation.preferences'),
      items: [
        {
          id: 'notification-settings',
          title: t('navigation.notificationSettings'),
          subtitle: t('navigation.notificationSettingsSubtitle'),
          icon: 'bell',
        },
        {
          id: 'privacy-settings',
          title: t('navigation.privacySettings'),
          subtitle: t('navigation.privacySettingsSubtitle'),
          icon: 'shield',
        },
      ],
    },
    {
      id: 'support',
      title: t('navigation.supportAndInfo'),
      items: [
        {
          id: 'help-faq',
          title: t('navigation.helpAndFaq'),
          subtitle: t('navigation.helpAndFaqSubtitle'),
          icon: 'help-circle',
        },
        {
          id: 'contact-support',
          title: t('navigation.contactSupport'),
          subtitle: t('navigation.contactSupportSubtitle'),
          icon: 'message-circle',
        },
        {
          id: 'report-problem',
          title: t('navigation.reportProblem'),
          subtitle: t('navigation.reportProblemSubtitle'),
          icon: 'alert-triangle',
          color: warningColor,
        },
        {
          id: 'terms-conditions',
          title: t('navigation.termsAndConditions'),
          subtitle: t('navigation.termsAndConditionsSubtitle'),
          icon: 'file',
        },
        {
          id: 'privacy-policy',
          title: t('navigation.privacyPolicy'),
          subtitle: t('navigation.privacyPolicySubtitle'),
          icon: 'lock',
        },
      ],
    },
    {
      id: 'secondary',
      title: t('navigation.secondaryActions'),
      items: [
        {
          id: 'refer-friend',
          title: t('navigation.referFriend'),
          subtitle: t('navigation.referFriendSubtitle'),
          icon: 'users',
        },
        {
          id: 'rate-app',
          title: t('navigation.rateApp'),
          subtitle: t('navigation.rateAppSubtitle'),
          icon: 'star',
          color: warningColor,
        },
        {
          id: 'about-sewalo',
          title: t('navigation.aboutSewalo'),
          subtitle: t('navigation.aboutSewaloSubtitle'),
          icon: 'info',
        },
      ],
    },
  ];
}

function createGuestSupportActions(t: TFunction): DrawerActionDefinition[] {
  return [
    {
      id: 'rate-app',
      title: t('navigation.rateApp'),
      subtitle: t('navigation.rateAppSubtitle'),
      icon: 'star',
      color: warningColor,
    },
    {
      id: 'about-sewalo',
      title: t('navigation.aboutSewalo'),
      subtitle: t('navigation.aboutSewaloSubtitle'),
      icon: 'info',
    },
    {
      id: 'privacy-policy',
      title: t('navigation.privacyPolicy'),
      subtitle: t('navigation.privacyPolicySubtitle'),
      icon: 'lock',
    },
    {
      id: 'terms-conditions',
      title: t('navigation.termsAndConditions'),
      subtitle: t('navigation.termsAndConditionsSubtitle'),
      icon: 'file',
    },
    {
      id: 'report-problem',
      title: t('navigation.reportProblem'),
      subtitle: t('navigation.reportProblemSubtitle'),
      icon: 'alert-triangle',
      color: warningColor,
    },
    {
      id: 'contact-support',
      title: t('navigation.contactSupport'),
      subtitle: t('navigation.contactSupportSubtitle'),
      icon: 'message-circle',
    },
  ];
}

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
  t: TFunction,
  currentLanguage: string,
  onLanguageChange: (code: string) => void,
  onActionPress?: (actionId: string) => void,
): SideDrawerSection {
  return {
    title: t('navigation.preferences'),
    items: [
      {
        type: 'language-toggle',
        id: 'language',
        title: t('navigation.language'),
        value: currentLanguage,
        onChange: (code: string) => {
          onLanguageChange(code);
          onActionPress?.('language');
        },
      },
    ],
  };
}

export function createRoleDrawerConfig(
  t: TFunction,
  { currentLanguage, onLanguageChange, onActionPress, onLogout }: CreateRoleDrawerConfigArgs,
): {
  sections: SideDrawerSection[];
  footerAction: SideDrawerFooterAction;
} {
  const sections = createRoleSections(t).map((section) => ({
    title: section.title,
    items:
      section.id === 'preferences'
        ? [
            ...createLanguageSection(t, currentLanguage, onLanguageChange, onActionPress).items,
            ...section.items.map((item) => createActionItem(item, onActionPress)),
          ]
        : section.items.map((item) => createActionItem(item, onActionPress)),
  }));

  return {
    sections,
    footerAction: {
      label: t('navigation.logout'),
      onPress: onLogout,
      icon: <Feather name="log-out" size={18} color="#dc2626" />,
      destructive: true,
    },
  };
}

export function createGuestDrawerConfig(
  t: TFunction,
  { currentLanguage, onLanguageChange, onActionPress }: CreateGuestDrawerConfigArgs,
): {
  sections: SideDrawerSection[];
  footerAction?: SideDrawerFooterAction;
} {
  return {
    sections: [
      createLanguageSection(t, currentLanguage, onLanguageChange, onActionPress),
      {
        title: t('navigation.supportAndInfo'),
        items: createGuestSupportActions(t).map((item) => createActionItem(item, onActionPress)),
      },
    ],
  };
}

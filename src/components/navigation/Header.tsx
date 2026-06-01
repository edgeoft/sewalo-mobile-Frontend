import { useRouter, useSegments } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '@/components/ui/LanguageSelector';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import TopBar from './TopBar';
import SideDrawer from './SideDrawer';
import { createGuestDrawerConfig, createRoleDrawerConfig } from './RoleDrawerConfig';
import { useAuth } from '@/providers/AuthProvider';

interface HeaderBaseProps {
  showBackButton?: boolean;
  leadingContent?: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  includeBottomBorder?: boolean;
}

type LanguageHeaderProps = HeaderBaseProps & {
  variant?: 'language';
};

type MenuHeaderProps = HeaderBaseProps & {
  variant: 'menu';
  onMenuPress?: () => void;
  showNotifications?: boolean;
  onNotificationsPress?: () => void;
};

type CustomHeaderProps = HeaderBaseProps & {
  variant: 'custom';
  rightContent: ReactNode;
};

type HeaderProps = LanguageHeaderProps | MenuHeaderProps | CustomHeaderProps;

export default function Header(props: HeaderProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { role } = useAuth();
  const segments = useSegments() as string[];

  const [drawerVisible, setDrawerVisible] = useState(false);
  const { showBackButton = false, leadingContent, containerClassName, contentClassName, includeBottomBorder } = props;

  const isGuest = role === 'guest' || segments.includes('(guest)');
  const drawerConfig = isGuest
    ? createGuestDrawerConfig({
        currentLanguage: i18n.language || 'en',
        onLanguageChange: (code) => i18n.changeLanguage(code),
      })
    : createRoleDrawerConfig({
        currentLanguage: i18n.language || 'en',
        onLanguageChange: (code) => i18n.changeLanguage(code),
        onLogout: () => setDrawerVisible(false),
      });

  const handleMenuPress = () => {
    if (props.variant === 'menu') {
      if (props.onMenuPress) {
        props.onMenuPress();
      } else {
        setDrawerVisible(true);
      }
    }
  };

  const renderRightContent = () => {
    if (props.variant === 'custom') {
      return props.rightContent;
    }

    if (props.variant === 'menu') {
      return (
        <View className="flex-row items-center gap-x-3">
          {props.showNotifications ? (
            <HeaderIconButton
              icon="bell"
              accessibilityLabel="Open notifications"
              onPress={props.onNotificationsPress}
            />
          ) : null}
          <HeaderIconButton icon="menu" accessibilityLabel="Open menu" onPress={handleMenuPress} />
        </View>
      );
    }

    return <LanguageSelector />;
  };

  return (
    <>
      <TopBar
        leadingContent={leadingContent}
        showBackButton={showBackButton}
        onBackPress={() => router.back()}
        rightContent={renderRightContent()}
        containerClassName={containerClassName}
        contentClassName={contentClassName}
        includeBottomBorder={includeBottomBorder}
      />
      {props.variant === 'menu' && (
        <SideDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          title="Menu"
          sections={drawerConfig.sections}
          footerAction={drawerConfig.footerAction}
        />
      )}
    </>
  );
}

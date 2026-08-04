import type { ReactNode } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '@/components/ui/LanguageSelector';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import TopBar from './TopBar';
import { useAuth } from '@/providers/AuthProvider';
import { useUnreadCountQuery } from '@/api';
import { USER_ROLES } from '@/types';
import { ROUTES } from '@/constants/routes';

interface HeaderBaseProps {
  showBackButton?: boolean;
  leadingContent?: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  includeBottomBorder?: boolean;
  onBackPress?: () => void;
  style?: Animated.WithAnimatedValue<ViewStyle>;
}

type MenuHeaderProps = HeaderBaseProps & {
  variant?: 'menu';
  showNotifications?: boolean;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
  showNotificationBadge?: boolean;
};

type LanguageHeaderProps = HeaderBaseProps & {
  variant: 'language';
};

type CustomHeaderProps = HeaderBaseProps & {
  variant: 'custom';
  rightContent: ReactNode;
};

type HeaderProps = MenuHeaderProps | LanguageHeaderProps | CustomHeaderProps;

export default function Header(props: HeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { role } = useAuth();
  const {
    showBackButton = false,
    leadingContent,
    containerClassName,
    contentClassName,
    includeBottomBorder,
    style,
  } = props;

  const isGuest = role === USER_ROLES.Guest;
  const isMenuVariant = props.variant === 'menu' || !props.variant;
  const showNotifications = isMenuVariant ? (props.showNotifications ?? !isGuest) : false;
  const showNotificationBadge = isMenuVariant ? (props.showNotificationBadge ?? true) : false;
  const handleNotificationsPress =
    isMenuVariant && props.onNotificationsPress ? props.onNotificationsPress : () => router.push(ROUTES.notifications);

  const { data: unreadData } = useUnreadCountQuery({
    enabled: !isGuest && showNotifications && showNotificationBadge,
  });
  const badgeCount = unreadData?.unread_count || 0;

  const renderRightContent = () => {
    if (props.variant === 'custom') {
      return props.rightContent;
    }

    if (props.variant === 'language' || isGuest) {
      return <LanguageSelector />;
    }

    if (showNotifications) {
      return (
        <View className="flex-row items-center">
          <HeaderIconButton
            icon="bell"
            accessibilityLabel={t('home.notificationAccessibility')}
            onPress={handleNotificationsPress}
            badgeCount={badgeCount}
          />
        </View>
      );
    }

    return <LanguageSelector />;
  };

  return (
    <TopBar
      leadingContent={leadingContent}
      showBackButton={showBackButton}
      onBackPress={props.onBackPress || (() => router.back())}
      rightContent={renderRightContent()}
      containerClassName={containerClassName}
      contentClassName={contentClassName}
      includeBottomBorder={includeBottomBorder}
      style={style}
    />
  );
}

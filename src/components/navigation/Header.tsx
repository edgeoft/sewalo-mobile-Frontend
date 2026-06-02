import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { View } from 'react-native';

import LanguageSelector from '@/components/ui/LanguageSelector';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import TopBar from './TopBar';
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
  const { role } = useAuth();
  const { showBackButton = false, leadingContent, containerClassName, contentClassName, includeBottomBorder } = props;

  const isGuest = role === 'guest';

  const renderRightContent = () => {
    if (props.variant === 'custom') {
      return props.rightContent;
    }

    if (props.variant === 'menu') {
      if (isGuest) {
        return <LanguageSelector />;
      }

      return props.showNotifications ? (
        <View className="flex-row items-center">
          <HeaderIconButton icon="bell" accessibilityLabel="Open notifications" onPress={props.onNotificationsPress} />
        </View>
      ) : null;
    }

    return <LanguageSelector />;
  };

  return (
    <TopBar
      leadingContent={leadingContent}
      showBackButton={showBackButton}
      onBackPress={() => router.back()}
      rightContent={renderRightContent()}
      containerClassName={containerClassName}
      contentClassName={contentClassName}
      includeBottomBorder={includeBottomBorder}
    />
  );
}

import { Feather } from '@expo/vector-icons';
import { Animated, Image, Pressable, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { LOGO } from '@/constants/images';

interface TopBarProps {
  leadingContent?: React.ReactNode;
  showBackButton?: boolean;
  rightContent: React.ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  includeBottomBorder?: boolean;
  onBackPress?: () => void;
  style?: Animated.WithAnimatedValue<ViewStyle>;
}

export default function TopBar({
  leadingContent,
  showBackButton = false,
  rightContent,
  containerClassName = 'bg-white',
  contentClassName = '',
  includeBottomBorder = true,
  onBackPress,
  style,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Animated.View
      style={[
        {
          paddingTop: Math.max(insets.top, 6),
          height: 56 + Math.max(insets.top, 6),
        },
        style,
      ]}
      className={`flex-row justify-between items-center px-4 ${containerClassName} ${includeBottomBorder ? 'border-b border-slate-100' : ''}`}
    >
      <View className={`flex-row items-center ${contentClassName}`}>
        {leadingContent}
        {showBackButton && (
          <Pressable
            onPress={onBackPress}
            className="-ml-1.5 mr-1.5 p-1.5 active:opacity-75"
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </Pressable>
        )}
        {!showBackButton && (
          <Image
            source={LOGO.secondary}
            className="w-28 h-11 -ml-1"
            resizeMode="contain"
            accessible={false}
            importantForAccessibility="no"
          />
        )}
      </View>

      {rightContent}
    </Animated.View>
  );
}

import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Animated, Pressable, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { LOGO } from '@/constants/images';
import { THEME_COLORS } from '@/constants/colors';

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
  containerClassName = 'bg-background',
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
      className={`flex-row justify-between items-center px-4 ${containerClassName} ${includeBottomBorder ? 'border-b border-border' : ''}`}
    >
      <View className={`flex-row items-center ${contentClassName}`}>
        {leadingContent}
        {showBackButton && (
          <Pressable
            onPress={onBackPress}
            className="-ml-1.5 mr-1.5 min-h-[44px] min-w-[44px] items-center justify-center active:opacity-75"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Feather name="arrow-left" size={20} color={THEME_COLORS.slate900} />
          </Pressable>
        )}
        {!showBackButton && (
          <Image
            source={LOGO.secondary}
            style={{ width: 112, height: 44 }}
            className="w-28 h-11 -ml-1 shrink-0"
            contentFit="contain"
            cachePolicy="memory-disk"
            accessible={false}
          />
        )}
      </View>

      {rightContent}
    </Animated.View>
  );
}

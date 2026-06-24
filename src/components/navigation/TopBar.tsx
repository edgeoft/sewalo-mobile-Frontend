import { Feather } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LOGO } from '@/constants/images';

interface TopBarProps {
  leadingContent?: React.ReactNode;
  showBackButton?: boolean;
  rightContent: React.ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  includeBottomBorder?: boolean;
  onBackPress?: () => void;
}

export default function TopBar({
  leadingContent,
  showBackButton = false,
  rightContent,
  containerClassName = 'bg-white border-b border-gray-100/50',
  contentClassName = '',
  includeBottomBorder = true,
  onBackPress,
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 6),
        height: 56 + Math.max(insets.top, 6),
      }}
      className={`flex-row justify-between items-center px-4 ${containerClassName} ${includeBottomBorder ? 'border-b border-gray-100/50' : ''}`}
    >
      <View className={`flex-row items-center ${contentClassName}`}>
        {leadingContent}
        {showBackButton && (
          <Pressable onPress={onBackPress} className="mr-1.5 active:opacity-75" hitSlop={8}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </Pressable>
        )}
        {!showBackButton && <Image source={LOGO.secondary} className="w-28 h-11" resizeMode="contain" />}
      </View>

      {rightContent}
    </View>
  );
}

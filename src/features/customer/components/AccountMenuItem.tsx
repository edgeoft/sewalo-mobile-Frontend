import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/colors';

interface AccountMenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

export default function AccountMenuItem({
  icon,
  title,
  subtitle,
  rightContent,
  onPress,
  destructive = false,
  showChevron = true,
}: AccountMenuItemProps) {
  const iconColor = destructive ? THEME_COLORS.dangerRed : THEME_COLORS.primary;
  const textColor = destructive ? 'text-red-500' : 'text-gray-700';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between py-3.5 px-4 bg-white border-b border-gray-100 last:border-b-0 active:bg-gray-50"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className={`h-9 w-9 rounded-xl items-center justify-center ${destructive ? 'bg-red-50' : 'bg-surface-indigo-subtle'}`}
        >
          <Feather name={icon} size={16} color={iconColor} accessible={false} />
        </View>

        <View className="ml-3.5 flex-1">
          <Text className={`text-sm font-sans-semibold ${textColor}`}>{title}</Text>
          {subtitle ? (
            <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center gap-x-2">
        {rightContent}
        {showChevron && <Feather name="chevron-right" size={16} color={THEME_COLORS.slate400} accessible={false} />}
      </View>
    </Pressable>
  );
}

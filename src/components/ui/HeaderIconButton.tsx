import React, { memo, type ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, View, Text } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface HeaderIconButtonProps {
  icon: FeatherIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  badgeCount?: number;
}

function HeaderIconButton({ icon, accessibilityLabel, onPress, badgeCount }: HeaderIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center active:opacity-60"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={badgeCount ? `${badgeCount} unread` : undefined}
    >
      <View importantForAccessibility="no" accessibilityElementsHidden>
        <Feather name={icon} size={18} color={THEME_COLORS.slate900} />
      </View>
      {badgeCount != null && badgeCount > 0 && (
        <View
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 items-center justify-center px-1"
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          <Text className="text-[9px] font-sans-bold text-white leading-none">
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default memo(HeaderIconButton);

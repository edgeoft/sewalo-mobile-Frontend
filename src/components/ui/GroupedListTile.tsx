import React, { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/colors';

export interface GroupedListTileProps {
  icon?: ComponentProps<typeof Feather>['name'] | React.ReactNode;
  title: string;
  subtitle?: string;
  destructive?: boolean;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function GroupedListTile({
  icon,
  title,
  subtitle,
  destructive = false,
  showChevron = true,
  rightContent,
  onPress,
  isFirst = false,
  isLast = false,
}: GroupedListTileProps) {
  const isFeatherIconName = typeof icon === 'string';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className={`flex-row items-center justify-between px-4 py-3.5 bg-white active:bg-slate-50/80 ${
        !isLast ? 'border-b border-slate-100' : ''
      } ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        {icon ? (
          <View
            className={`h-9 w-9 rounded-lg items-center justify-center mr-3 ${
              destructive ? 'bg-red-50' : 'bg-slate-100/80'
            }`}
          >
            {isFeatherIconName ? (
              <Feather
                name={icon as ComponentProps<typeof Feather>['name']}
                size={18}
                color={destructive ? '#ef4444' : THEME_COLORS.slate700}
                accessible={false}
              />
            ) : (
              icon
            )}
          </View>
        ) : null}

        <View className="flex-1">
          <Text
            className={`text-sm ${
              destructive ? 'font-sans-bold text-destructive' : 'font-sans-semibold text-gray-900'
            }`}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs font-sans-medium text-gray-500 mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center">
        {rightContent}
        {showChevron ? (
          <Feather
            name="chevron-right"
            size={18}
            color={THEME_COLORS.slate400}
            style={{ marginLeft: rightContent ? 8 : 0 }}
            accessible={false}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

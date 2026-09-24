import React, { memo, useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { getImageUrl } from '@/utils/image';
import { THEME_COLORS } from '@/constants/colors';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface HomeServiceCategoryCardProps {
  icon?: FeatherIconName;
  imageUrl?: string | null;
  label: string;
  onPress?: () => void;
}

const ICON_STYLE = { width: 32, height: 32 };

function HomeServiceCategoryCard({ icon, imageUrl, label, onPress }: HomeServiceCategoryCardProps) {
  const resolvedImageUrl = useMemo(() => (imageUrl ? getImageUrl(imageUrl) : null), [imageUrl]);

  return (
    <Pressable
      onPress={onPress}
      className="w-20 shrink-0 items-center"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <View className="h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white overflow-hidden">
        {resolvedImageUrl ? (
          <Image source={{ uri: resolvedImageUrl }} className="h-8 w-8" style={ICON_STYLE} contentFit="contain" />
        ) : (
          <Feather name={icon || 'grid'} size={20} color={THEME_COLORS.primary} />
        )}
      </View>

      <Text
        className="mt-1.5 text-center text-[11px] font-sans-medium leading-[14px] text-gray-900 w-full px-0.5"
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default memo(HomeServiceCategoryCard);

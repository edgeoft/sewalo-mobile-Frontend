import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { getImageUrl } from '@/utils/image';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface HomeServiceCategoryCardProps {
  icon?: FeatherIconName;
  imageUrl?: string | null;
  label: string;
  onPress?: () => void;
}

export default function HomeServiceCategoryCard({ icon, imageUrl, label, onPress }: HomeServiceCategoryCardProps) {
  const hasImage = imageUrl && getImageUrl(imageUrl);

  return (
    <Pressable
      onPress={onPress}
      className="w-20 shrink-0 items-center"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)' }}
      >
        {hasImage ? (
          <Image source={{ uri: getImageUrl(imageUrl) }} className="h-8 w-8" resizeMode="contain" />
        ) : (
          <Feather name={icon || 'grid'} size={20} color="#485aff" />
        )}
      </View>

      <Text className="mt-1.5 text-center text-[11px] font-sans-medium leading-3 text-gray-900 w-14" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

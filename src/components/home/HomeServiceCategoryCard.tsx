import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface HomeServiceCategoryCardProps {
  icon: FeatherIconName;
  label: string;
  onPress?: () => void;
}

export default function HomeServiceCategoryCard({ icon, label, onPress }: HomeServiceCategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-22 shrink-0 items-center"
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white"
        style={{ boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)' }}
      >
        <Feather name={icon} size={18} color="#485aff" />
      </View>

      <Text className="mt-2.5 text-center text-xs font-sans-medium leading-4 text-gray-900" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

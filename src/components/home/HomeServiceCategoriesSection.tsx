import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import HomeServiceCategoryCard from './HomeServiceCategoryCard';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface HomeServiceCategory {
  icon: FeatherIconName;
  label: string;
}

export const DEFAULT_HOME_SERVICE_CATEGORIES: HomeServiceCategory[] = [
  {
    icon: 'code',
    label: 'Computers & IT',
  },
  {
    icon: 'pen-tool',
    label: 'Design',
  },
  {
    icon: 'home',
    label: 'Cleaning',
  },
  {
    icon: 'droplet',
    label: 'Plumbing',
  },
  {
    icon: 'tool',
    label: 'Maintenance',
  },
  {
    icon: 'zap',
    label: 'Electrical',
  },
  {
    icon: 'scissors',
    label: 'Beauty',
  },
  {
    icon: 'truck',
    label: 'Moving',
  },
  {
    icon: 'feather',
    label: 'Painting',
  },
  {
    icon: 'sun',
    label: 'Gardening',
  },
];

export interface HomeServiceCategoriesSectionProps {
  title: string;
  actionLabel: string;
  categories: HomeServiceCategory[];
  onActionPress?: () => void;
  onCategoryPress?: (category: HomeServiceCategory) => void;
}

export default function HomeServiceCategoriesSection({
  title,
  actionLabel,
  categories,
  onActionPress,
  onCategoryPress,
}: HomeServiceCategoriesSectionProps) {
  return (
    <View className="pt-8">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-xl font-sans-bold tracking-tight text-gray-900">{title}</Text>

        <Pressable onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <View className="flex-row items-center gap-0.5">
            <Text className="text-[11px] font-sans-medium text-gray-400">{actionLabel}</Text>
            <Feather name="chevron-right" size={13} color="#9ca3af" />
          </View>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5, paddingRight: 4 }}>
        {categories.map((category) => (
          <HomeServiceCategoryCard
            key={category.label}
            icon={category.icon}
            label={category.label}
            onPress={() => onCategoryPress?.(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

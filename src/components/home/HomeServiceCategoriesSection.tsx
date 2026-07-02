import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import HomeServiceCategoryCard from './HomeServiceCategoryCard';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface HomeServiceCategory {
  icon?: FeatherIconName;
  imageUrl?: string | null;
  label: string;
  slug?: string;
}

export function getDefaultHomeServiceCategories(t: (key: string) => string): HomeServiceCategory[] {
  return [
    { icon: 'code', label: t('home.computersAndIT') },
    { icon: 'pen-tool', label: t('home.design') },
    { icon: 'home', label: t('home.cleaning') },
    { icon: 'droplet', label: t('home.plumbing') },
    { icon: 'tool', label: t('home.maintenance') },
    { icon: 'zap', label: t('home.electrical') },
    { icon: 'scissors', label: t('home.beauty') },
    { icon: 'truck', label: t('home.moving') },
    { icon: 'feather', label: t('home.painting') },
    { icon: 'sun', label: t('home.gardening') },
  ];
}

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
    <View className="pt-5">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-xl font-sans-bold tracking-tight text-gray-900">{title}</Text>

        <Pressable onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <View className="flex-row items-center gap-0.5">
            <Text className="text-[11px] font-sans-medium text-gray-400">{actionLabel}</Text>
            <Feather name="chevron-right" size={13} color="#9ca3af" />
          </View>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingRight: 4 }}>
        {categories.map((category) => (
          <HomeServiceCategoryCard
            key={category.label}
            icon={category.icon}
            imageUrl={category.imageUrl}
            label={category.label}
            onPress={() => onCategoryPress?.(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScrollView, View } from 'react-native';

import SectionHeader from '@/components/common/SectionHeader';
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
      <SectionHeader title={title} actionLabel={actionLabel} onActionPress={onActionPress} className="mb-5" />

      <View className="-mx-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 4, paddingRight: 16, gap: 4 }}
        >
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
    </View>
  );
}

import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/utils/image';

interface CategoryScrollSelectorProps {
  selectedCategorySlug?: string;
  onSelectCategory: (slug: string | undefined) => void;
  categories?: any[];
  isLoading: boolean;
  horizontalPaddingClass?: 'px-0' | 'px-4';
}

const SPACING_MAP = {
  'px-0': 0,
  'px-4': 16,
};

export default function CategoryScrollSelector({
  selectedCategorySlug,
  onSelectCategory,
  categories,
  isLoading,
  horizontalPaddingClass = 'px-0',
}: CategoryScrollSelectorProps) {
  const { t } = useTranslation();

  // titlePaddingClass will be px-0 for padded screens (like FindServicesScreen)
  // and px-4 for unpadded screens (like MapServicesScreen)
  const titlePaddingClass = horizontalPaddingClass;
  const paddingVal = SPACING_MAP[horizontalPaddingClass] ?? 0;

  return (
    <View className="mb-6">
      <View className={`mb-3 ${titlePaddingClass}`}>
        <Text className="text-lg font-sans-bold text-gray-950 tracking-tight">{t('services.browseByCategory')}</Text>
      </View>

      {isLoading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="var(--primary)" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: paddingVal, gap: 10 }}
        >
          <Pressable
            onPress={() => onSelectCategory(undefined)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategorySlug === undefined }}
            className={`px-4 py-2.5 rounded-full flex-row items-center border ${
              selectedCategorySlug === undefined ? 'bg-primary border-primary' : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-xs font-sans-semibold ${
                selectedCategorySlug === undefined ? 'text-white' : 'text-gray-700'
              }`}
            >
              {t('services.allServices')}
            </Text>
          </Pressable>

          {categories?.map((category) => {
            const isSelected = selectedCategorySlug === category.slug;
            const iconUri = getImageUrl(category.icon);

            return (
              <Pressable
                key={category.id}
                onPress={() => onSelectCategory(isSelected ? undefined : category.slug)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`px-4 py-2.5 rounded-full flex-row items-center border ${
                  isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                }`}
              >
                {iconUri ? (
                  <Image source={{ uri: iconUri }} className="h-4 w-4 mr-2" resizeMode="contain" accessible={false} />
                ) : (
                  <Feather
                    name="tag"
                    size={12}
                    color={isSelected ? 'var(--primary-foreground)' : 'var(--primary)'}
                    style={{ marginRight: 6 }}
                    accessible={false}
                  />
                )}
                <Text className={`text-xs font-sans-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

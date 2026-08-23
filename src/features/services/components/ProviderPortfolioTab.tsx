import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

import { FALLBACKS } from '@/utils/image';

import { PortfolioItem } from '@/types';

interface ProviderPortfolioTabProps {
  portfolio: PortfolioItem[];
  onImagePress: (uri: string) => void;
}

export default function ProviderPortfolioTab({ portfolio, onImagePress }: ProviderPortfolioTabProps) {
  const { t } = useTranslation();
  const [erroredIds, setErroredIds] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setErroredIds((prev) => new Set(prev).add(id));
  };
  if (portfolio.length === 0) {
    return (
      <View className="bg-white border border-gray-200 rounded-lg px-5 py-8 items-center" style={styles.shadowMin}>
        <View className="h-16 w-16 bg-gray-50 rounded-full items-center justify-center mb-3">
          <Feather name="image" size={28} color="#94a3b8" />
        </View>
        <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{t('services.noWorkSamples')}</Text>
        <Text className="text-xs font-sans-medium text-gray-400 text-center leading-4 max-w-[240px]">
          This provider hasn&apos;t uploaded any past work or case studies to their portfolio yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {portfolio.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onImagePress(item.uri)}
          accessibilityRole="button"
          accessibilityLabel={item.title ? undefined : t('services.workSamples')}
          className="w-[48%] bg-white border border-gray-200 rounded-lg overflow-hidden active:opacity-90"
          style={styles.shadowMin}
        >
          <Image
            source={{ uri: erroredIds.has(item.id) ? FALLBACKS.image : item.uri }}
            onError={() => handleImageError(item.id)}
            style={{ height: 110, width: '100%' }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            accessible={false}
          />
          {item.title && (
            <View className="p-2">
              <Text className="text-[10px] font-sans-bold text-gray-800" numberOfLines={1}>
                {item.title}
              </Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowMin: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 0,
  },
});

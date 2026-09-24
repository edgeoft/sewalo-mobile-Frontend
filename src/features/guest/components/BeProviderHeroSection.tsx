import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

import { BECOME_PROVIDER } from '@/constants/images';

export default function BeProviderHeroSection() {
  const { t } = useTranslation();

  return (
    <View className="pt-4 pb-6">
      <View className="rounded-2xl bg-primary p-5 overflow-hidden">
        {/* Hero Header Content */}
        <View className="mb-4">
          <Text className="text-2xl font-sans-extrabold text-white tracking-tight leading-8 mb-2">
            {t('guest.heroTitle')}
          </Text>
          <Text className="text-xs font-sans-medium text-white/85 leading-5">{t('guest.heroDesc')}</Text>
        </View>

        {/* Asymmetric Bento Showcase Collage */}
        <View className="flex-row gap-3 mt-1">
          {/* Main Featured Card (Left Column) */}
          <View className="w-[56%] h-[224px] rounded-xl overflow-hidden border border-white/25 bg-blue-950/40">
            <Image source={BECOME_PROVIDER.hero} className="h-full w-full rounded-xl" resizeMode="cover" />
          </View>

          {/* Secondary Stack (Right Column) */}
          <View className="flex-1 justify-between gap-3">
            {/* Top Right Card */}
            <View className="h-[106px] rounded-xl overflow-hidden border border-white/25 bg-blue-950/40">
              <Image source={BECOME_PROVIDER.process} className="h-full w-full rounded-xl" resizeMode="cover" />
            </View>

            {/* Bottom Right Card */}
            <View className="h-[106px] rounded-xl overflow-hidden border border-white/25 bg-blue-950/40">
              <Image source={BECOME_PROVIDER.benefits} className="h-full w-full rounded-xl" resizeMode="cover" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

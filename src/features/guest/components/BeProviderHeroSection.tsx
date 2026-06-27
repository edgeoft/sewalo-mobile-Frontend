import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

import { BECOME_PROVIDER } from '@/constants/images';

export default function BeProviderHeroSection() {
  const { t } = useTranslation();

  return (
    <View className="pt-5 pb-8">
      <View className="rounded-2xl bg-primary p-5 overflow-hidden">
        <View className="mb-5">
          <Text className="text-3xl font-sans-extrabold text-white tracking-tight leading-10 mb-3">
            {t('guest.heroTitle')}
          </Text>
          <Text className="text-sm font-sans-medium text-white/85 leading-6">{t('guest.heroDesc')}</Text>
        </View>

        <Image source={BECOME_PROVIDER.hero} className="w-full h-44 rounded-xl" resizeMode="cover" />
      </View>
    </View>
  );
}

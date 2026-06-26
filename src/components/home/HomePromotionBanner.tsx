import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export interface HomePromotionBannerProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onPress?: () => void;
}

export default function HomePromotionBanner({ title, description, buttonLabel, onPress }: HomePromotionBannerProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('home.unlockRewards');
  const resolvedDescription = description ?? t('home.promoDescription');
  const resolvedButtonLabel = buttonLabel ?? t('home.startBookingNow');
  return (
    <View className="pt-5">
      {/* Promotion Card Container */}
      <View className="rounded-2xl bg-primary p-6 shadow-sm">
        {/* Title */}
        <Text className="text-xl font-sans-bold text-white mb-2">{resolvedTitle}</Text>

        {/* Description */}
        <Text className="text-sm font-sans-medium text-[#eef1ff] leading-5 mb-6">{resolvedDescription}</Text>

        {/* Action Button */}
        <Pressable
          onPress={onPress}
          className="w-full bg-white rounded-xl py-3.5 items-center justify-center active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel={resolvedButtonLabel}
        >
          <Text className="text-sm font-sans-bold text-primary">{resolvedButtonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

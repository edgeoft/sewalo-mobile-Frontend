import { Pressable, Text, View } from 'react-native';

export interface HomePromotionBannerProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onPress?: () => void;
}

export default function HomePromotionBanner({
  title = 'Unlock rewards with every booking',
  description = 'Earn loyalty points and turn them into real savings on the services you love.',
  buttonLabel = 'Start Booking now →',
  onPress,
}: HomePromotionBannerProps) {
  return (
    <View className="pt-8">
      {/* Promotion Card Container */}
      <View className="rounded-2xl bg-primary p-6 shadow-sm">
        {/* Title */}
        <Text className="text-xl font-sans-bold text-white mb-2">{title}</Text>

        {/* Description */}
        <Text className="text-sm font-sans-medium text-[#eef1ff] leading-5 mb-6">{description}</Text>

        {/* Action Button */}
        <Pressable
          onPress={onPress}
          className="w-full bg-white rounded-xl py-3.5 items-center justify-center active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
        >
          <Text className="text-sm font-sans-bold text-primary">{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

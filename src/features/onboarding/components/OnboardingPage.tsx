import { Image, ImageSourcePropType, Text, View, useWindowDimensions } from 'react-native';

interface OnboardingPageProps {
  title: string;
  description: string;
  illustration?: ImageSourcePropType;
}

export default function OnboardingPage({
  title,
  description,
  illustration = require('@/assets/onboarding/illustration_one.png'),
}: OnboardingPageProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width, height: '100%' }} className="items-center justify-start py-6 px-6 bg-transparent">
      <View className="flex-1 w-full justify-center items-center bg-transparent border-0 mb-6">
        <Image source={illustration} className="w-full h-full border-0" resizeMode="contain" />
      </View>

      <View className="items-center justify-start w-full px-2 h-28">
        <Text className="text-gray-900 text-[22px] font-sans-bold text-center mb-3 leading-tight pt-1">{title}</Text>
        <Text className="text-gray-600 text-[13px] font-sans-medium text-center leading-5.5">{description}</Text>
      </View>
    </View>
  );
}

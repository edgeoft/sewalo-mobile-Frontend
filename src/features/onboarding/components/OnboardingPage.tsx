import { Image, Text, View, useWindowDimensions } from 'react-native';

interface OnboardingPageProps {
  title: string;
  description: string;
}

export default function OnboardingPage({ title, description }: OnboardingPageProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width, height: '100%' }} className="items-center justify-between py-6 px-6 bg-transparent">
      <View className="w-full h-72 justify-center items-center bg-transparent border-0">
        <Image
          source={require('@/assets/onboarding/illustration_one.png')}
          className="w-full h-full border-0"
          resizeMode="contain"
        />
      </View>

      <View className="items-center justify-start w-full px-2 mt-6 h-36">
        <Text className="text-gray-900 text-[26px] font-sans-bold text-center mb-3 leading-tight pt-1">{title}</Text>
        <Text className="text-gray-600 text-[14px] font-sans-medium text-center leading-5.5">{description}</Text>
      </View>
    </View>
  );
}

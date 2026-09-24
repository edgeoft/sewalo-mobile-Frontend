import React, { memo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import ContentLayout from '@/components/layout/ContentLayout';

interface OnboardingPageProps {
  title: string;
  description: string;
  illustration?: ImageSource | React.ReactNode;
}

function OnboardingPage({
  title,
  description,
  illustration = require('@/assets/onboarding/illustration_one.png'),
}: OnboardingPageProps) {
  const { width } = useWindowDimensions();

  return (
    <ContentLayout style={{ width, height: '100%' }} className="items-center justify-start py-6 bg-transparent">
      <View className="flex-1 w-full justify-center items-center bg-transparent border-0 mb-6">
        {React.isValidElement(illustration) ? (
          illustration
        ) : (
          <Image source={illustration as ImageSource} className="w-full h-full border-0" contentFit="contain" />
        )}
      </View>

      <View className="items-center justify-start w-full px-2 h-28">
        <Text className="text-gray-900 text-2xl font-sans-bold text-center mb-3 leading-tight pt-1">{title}</Text>
        <Text className="text-gray-600 text-sm font-sans-medium text-center leading-5.5">{description}</Text>
      </View>
    </ContentLayout>
  );
}

export default memo(OnboardingPage);

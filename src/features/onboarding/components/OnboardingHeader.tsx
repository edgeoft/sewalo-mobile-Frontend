import React, { memo } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

import LanguageSelector from '@/components/ui/LanguageSelector';
import { LOGO } from '@/constants/images';

interface OnboardingHeaderProps {
  topInset: number;
}

function OnboardingHeader({ topInset }: OnboardingHeaderProps) {
  return (
    <View
      style={{
        paddingTop: Math.max(topInset, 16),
      }}
      className="flex-row justify-between items-center px-6 py-2 bg-white"
    >
      <Image source={LOGO.primary} className="w-30 h-8" contentFit="contain" />
      <LanguageSelector />
    </View>
  );
}

export default memo(OnboardingHeader);

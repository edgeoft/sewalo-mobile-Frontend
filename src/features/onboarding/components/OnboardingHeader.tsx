import { Image, View } from 'react-native';

import LanguageSelector from '@/components/LanguageSelector';

interface OnboardingHeaderProps {
  topInset: number;
}

export default function OnboardingHeader({ topInset }: OnboardingHeaderProps) {
  return (
    <View
      style={{
        paddingTop: Math.max(topInset, 16),
      }}
      className="flex-row justify-between items-center px-6 py-2 bg-white"
    >
      <Image source={require('@/assets/sewalo_logo.png')} className="w-30 h-8" resizeMode="contain" />
      <LanguageSelector />
    </View>
  );
}

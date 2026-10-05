import { View } from 'react-native';
import { Image } from 'expo-image';

import LanguageSelector from '@/components/ui/LanguageSelector';
import { LOGO } from '@/constants/images';

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
      <Image
        source={LOGO.primary}
        style={{ width: 120, height: 32 }}
        className="w-30 h-8 shrink-0"
        contentFit="contain"
        cachePolicy="memory-disk"
        accessible={false}
      />
      <LanguageSelector />
    </View>
  );
}

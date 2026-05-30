import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LanguageSelector from '@/components/LanguageSelector';

export default function AuthHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 8),
      }}
      className="flex-row justify-between items-center px-4 pb-1.5 pt-1 bg-white border-b border-gray-100/50"
    >
      <Image source={require('@/assets/sewalo_logo_secondary.png')} className="w-32 h-14" resizeMode="contain" />
      <LanguageSelector />
    </View>
  );
}

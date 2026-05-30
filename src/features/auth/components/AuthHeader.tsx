import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LanguageSelector from '@/components/LanguageSelector';
import { LOGO } from '@/constants/images';

interface AuthHeaderProps {
  showBackButton?: boolean;
}

export default function AuthHeader({ showBackButton = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 6),
      }}
      className="flex-row justify-between items-center px-4 pb-1 pt-0.5 bg-white border-b border-gray-100/50"
    >
      <View className="flex-row items-center">
        {showBackButton && (
          <Pressable onPress={() => router.back()} className="mr-1.5 active:opacity-75" hitSlop={8}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </Pressable>
        )}
        <Image source={LOGO.secondary} className="w-28 h-11" resizeMode="contain" />
      </View>
      <LanguageSelector />
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LanguageSelector from '@/components/LanguageSelector';
import OnboardingPage from '../components/OnboardingPage';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const pages = [
    {
      title: t('onboarding.screen1.title'),
      description: t('onboarding.screen1.description'),
    },
    {
      title: t('onboarding.screen2.title'),
      description: t('onboarding.screen2.description'),
    },
    {
      title: t('onboarding.screen3.title'),
      description: t('onboarding.screen3.description'),
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex && index >= 0 && index < pages.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < pages.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    router.replace('/auth' as any);
  };

  return (
    <View className="flex-1 bg-primary">
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
        className="flex-[0.8] bg-white justify-between pb-4 shadow-md"
      >
        <View className="flex-row justify-between items-center px-6 py-2">
          <Image source={require('@/assets/sewalo_logo.png')} className="w-[120px] h-[32px]" resizeMode="contain" />

          <LanguageSelector />
        </View>

        {/* Carousel Content */}
        <View className="flex-1 mt-4">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            className="flex-1"
          >
            {pages.map((page, index) => (
              <OnboardingPage key={index} title={page.title} description={page.description} />
            ))}
          </ScrollView>
        </View>
      </View>

      <View
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        className="flex-[0.2] justify-between items-center px-8 pt-6"
      >
        <View className="flex-row items-center justify-center">
          {pages.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <View
                key={index}
                className={`h-2.5 w-2.5 rounded-full mx-1.5 transition-all duration-300 ${
                  isActive ? 'bg-white' : 'bg-white/40'
                }`}
              />
            );
          })}
        </View>

        <View className="flex-row justify-between items-center w-full mt-4">
          <Pressable onPress={handleFinish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text className="text-white text-base font-sans-semibold opacity-90 active:opacity-60">
              {t('onboarding.skip')}
            </Text>
          </Pressable>

          {/* Next / Get Started Button */}
          <Pressable onPress={handleNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text className="text-white text-base font-sans-semibold active:opacity-60">
              {activeIndex === pages.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
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

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
}

function PaginationDots({ count, activeIndex }: PaginationDotsProps) {
  return (
    <View className="flex-row items-center justify-center" accessibilityRole="tablist">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            accessible
            accessibilityRole="tab"
            accessibilityLabel={`Page ${index + 1} of ${count}`}
            accessibilityState={{ selected: isActive }}
            className={`h-2.5 w-2.5 rounded-full mx-1.5 transition-all duration-300 ${
              isActive ? 'bg-white' : 'bg-white/40'
            }`}
          />
        );
      })}
    </View>
  );
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Tracks whether the scroll was triggered programmatically (via handleNext)
  // so manual swipe events don't fight with it.
  const isAutoScrolling = useRef(false);

  // Memoized so the array isn't recreated on every render.
  // Re-evaluates only when the translation function reference changes (i.e. on locale change).
  const pages = useMemo(
    () => [
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
    ],
    [t],
  );

  const isLastPage = activeIndex === pages.length - 1;

  const handleFinish = useCallback(() => {
    router.replace('/auth');
  }, [router]);

  const handleNext = useCallback(() => {
    if (!isLastPage) {
      isAutoScrolling.current = true;
      const nextIndex = activeIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);

      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 500);
    } else {
      handleFinish();
    }
  }, [activeIndex, isLastPage, width, handleFinish]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isAutoScrolling.current) return;
      const scrollOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollOffset / width);
      if (index !== activeIndex && index >= 0 && index < pages.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, pages.length, width],
  );

  const handleMomentumScrollEnd = useCallback(() => {
    isAutoScrolling.current = false;
  }, []);

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
          <Image source={require('@/assets/sewalo_logo.png')} className="w-30 h-8" resizeMode="contain" />
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
            onMomentumScrollEnd={handleMomentumScrollEnd}
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
        <PaginationDots count={pages.length} activeIndex={activeIndex} />

        <View className="flex-row justify-between items-center w-full mt-4">
          <Pressable
            onPress={handleFinish}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={t('onboarding.skip')}
            accessibilityRole="button"
          >
            <Text className="text-white text-base font-sans-semibold opacity-90 active:opacity-60">
              {t('onboarding.skip')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={isLastPage ? t('onboarding.getStarted') : t('onboarding.next')}
            accessibilityRole="button"
          >
            <Text className="text-white text-base font-sans-semibold active:opacity-60">
              {isLastPage ? t('onboarding.getStarted') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

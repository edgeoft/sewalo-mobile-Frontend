import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES } from '@/constants/routes';
import OnboardingFooter from '../components/OnboardingFooter';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingPage from '../components/OnboardingPage';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAutoScrolling = useRef(false);

  const pages = useMemo(
    () => [
      {
        title: t('onboarding.screen1.title'),
        description: t('onboarding.screen1.description'),
        illustration: require('@/assets/onboarding/illustration_one.png'),
      },
      {
        title: t('onboarding.screen2.title'),
        description: t('onboarding.screen2.description'),
        illustration: require('@/assets/onboarding/illustration_one.png'),
      },
      {
        title: t('onboarding.screen3.title'),
        description: t('onboarding.screen3.description'),
        illustration: require('@/assets/onboarding/illustration_one.png'),
      },
    ],
    [t],
  );

  const isLastPage = activeIndex === pages.length - 1;

  const handleFinish = useCallback(() => {
    router.replace(ROUTES.auth.signin);
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
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
        className="flex-[0.75] bg-white justify-between pb-4 shadow-md"
      >
        <OnboardingHeader topInset={insets.top} />

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
              <OnboardingPage
                key={index}
                title={page.title}
                description={page.description}
                illustration={page.illustration}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      <OnboardingFooter
        activeIndex={activeIndex}
        pagesCount={pages.length}
        bottomInset={insets.bottom}
        onNext={handleNext}
        onFinish={handleFinish}
      />
    </View>
  );
}

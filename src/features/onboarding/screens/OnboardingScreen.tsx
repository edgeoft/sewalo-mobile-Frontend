import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/types';
import OnboardingFooter from '../components/OnboardingFooter';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingPage from '../components/OnboardingPage';
import OnboardingIllustrationOne from '@/components/illustrations/OnboardingIllustrationOne';
import OnboardingIllustrationTwo from '@/components/illustrations/OnboardingIllustrationTwo';
import OnboardingIllustrationThree from '@/components/illustrations/OnboardingIllustrationThree';

import * as SecureStore from 'expo-secure-store';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      // 1. If user is logged in, redirect to dashboard
      if (isLoggedIn && user) {
        if (user.status === 'pending') {
          router.replace({
            pathname: ROUTES.auth.gettingStarted,
            params: { role, phone: user.phone },
          });
        } else {
          if (role === USER_ROLES.Provider) {
            router.replace(ROUTES.provider.home);
          } else {
            router.replace(ROUTES.customer.home);
          }
        }
        return;
      }

      // 2. If not logged in, check if they already completed onboarding
      if (!isLoading) {
        try {
          const completed = await SecureStore.getItemAsync('onboarding_completed');
          if (completed === 'true') {
            router.replace(ROUTES.auth.signin);
            return;
          }
        } catch (e) {
          console.warn('Error reading onboarding completed flag:', e);
        }
        setCheckingOnboarding(false);
      }
    };

    checkStatus();
  }, [isLoggedIn, role, user, isLoading, router]);

  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAutoScrolling = useRef(false);

  const pages = useMemo(
    () => [
      {
        title: t('onboarding.screen1.title'),
        description: t('onboarding.screen1.description'),
        illustration: <OnboardingIllustrationOne />,
      },
      {
        title: t('onboarding.screen2.title'),
        description: t('onboarding.screen2.description'),
        illustration: <OnboardingIllustrationTwo />,
      },
      {
        title: t('onboarding.screen3.title'),
        description: t('onboarding.screen3.description'),
        illustration: <OnboardingIllustrationThree />,
      },
    ],
    [t],
  );

  const isLastPage = activeIndex === pages.length - 1;

  const handleFinish = useCallback(async () => {
    try {
      await SecureStore.setItemAsync('onboarding_completed', 'true');
    } catch (e) {
      console.warn('Failed to save onboarding completed flag:', e);
    }
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

  if (checkingOnboarding) {
    return null;
  }

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
                illustration={
                  index === 0 ? (
                    <OnboardingIllustrationOne />
                  ) : index === 1 ? (
                    <OnboardingIllustrationTwo isActive={activeIndex === index} />
                  ) : (
                    <OnboardingIllustrationThree isActive={activeIndex === index} />
                  )
                }
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

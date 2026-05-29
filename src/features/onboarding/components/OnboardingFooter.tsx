import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import PaginationDots from './PaginationDots';

interface OnboardingFooterProps {
  activeIndex: number;
  pagesCount: number;
  bottomInset: number;
  onNext: () => void;
  onFinish: () => void;
}

export default function OnboardingFooter({
  activeIndex,
  pagesCount,
  bottomInset,
  onNext,
  onFinish,
}: OnboardingFooterProps) {
  const { t } = useTranslation();
  const isLastPage = activeIndex === pagesCount - 1;

  return (
    <View
      style={{ paddingBottom: bottomInset > 0 ? bottomInset - 8 : 4 }}
      className="flex-[0.25] justify-end items-center px-8 relative"
    >
      <View className="absolute mt-4 top-4 left-0 right-0 items-center justify-center">
        <PaginationDots count={pagesCount} activeIndex={activeIndex} />
      </View>

      {isLastPage ? (
        <View className="w-full items-center mt-6">
          <Button
            variant="light"
            size="md"
            title={t('onboarding.getStarted')}
            onPress={onNext}
            className="w-full shadow-sm"
          />
          <View className="flex-row items-center justify-center mt-3">
            <Text className="text-white/80 text-sm font-sans-medium">{t('onboarding.alreadyHaveAccount')} </Text>
            <Pressable onPress={onFinish} hitSlop={8}>
              <Text className="text-white text-sm font-sans-bold">{t('onboarding.login')}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex-row justify-between items-center w-full mt-6 mb-[-4]">
          <Button
            variant="ghost"
            size="md"
            title={t('onboarding.skip')}
            onPress={onFinish}
            textClassName="opacity-95"
          />
          <Button variant="ghost" size="md" title={t('onboarding.next')} onPress={onNext} />
        </View>
      )}
    </View>
  );
}

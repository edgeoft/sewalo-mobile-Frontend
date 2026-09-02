import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ContentLayout from '@/components/layout/ContentLayout';
import OnboardingStickyFooter from './OnboardingStickyFooter';

interface FinishOnboardingStepProps {
  onFinish: () => void;
}

export default function FinishOnboardingStep({ onFinish }: FinishOnboardingStepProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-between bg-transparent">
      <ContentLayout scrollable={false} className="flex-1">
        <View className="flex-1 items-center justify-center py-8">
          {/* Celebration Circle */}
          <View className="h-28 w-28 rounded-full bg-emerald-50 items-center justify-center mb-6 shadow-sm border border-emerald-100">
            <Feather name="check" size={56} color="#059669" />
          </View>

          <Text className="text-2xl font-sans-extrabold text-gray-950 text-center mb-2">
            {t('onboarding.allSetTitle')}
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 text-center px-6 leading-relaxed">
            {t('onboarding.allSetDesc')}
          </Text>
        </View>
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <OnboardingStickyFooter primaryTitle={t('onboarding.finishSetup')} onPrimaryPress={onFinish} />
    </View>
  );
}

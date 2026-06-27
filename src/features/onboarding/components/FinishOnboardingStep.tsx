import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';

interface FinishOnboardingStepProps {
  onFinish: () => void;
}

export default function FinishOnboardingStep({ onFinish }: FinishOnboardingStepProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <ContentLayout scrollable={false} className="flex-1 justify-between bg-transparent">
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

      {/* Sticky Bottom Actions Container */}
      <View
        className="-mx-4 bg-white border-t border-gray-100 px-5 pt-2.5"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 10,
        }}
      >
        <Button
          title={t('onboarding.finishSetup')}
          onPress={onFinish}
          variant="primary"
          size="sm"
          className="w-full bg-primary"
        />
      </View>
    </ContentLayout>
  );
}

import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import AvailabilityEditor from '@/components/common/AvailabilityEditor';

import type { AvailabilityType } from '@/constants/availability';

interface AvailabilityStepProps {
  workingDays: AvailabilityType;
  setWorkingDays: (days: AvailabilityType) => void;
  workingHoursStart: string;
  workingHoursEnd: string;
  onChangeHours: (start: string, end: string) => void;
  onNext: () => void;
  stepper?: React.ReactNode;
}

export default function AvailabilityStep({
  workingDays,
  setWorkingDays,
  workingHoursStart,
  workingHoursEnd,
  onChangeHours,
  onNext,
  stepper,
}: AvailabilityStepProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 justify-between bg-transparent">
      <ContentLayout
        scrollable
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 24,
        }}
      >
        {stepper}

        <View className="rounded-2xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
          <View className="mb-3">
            <Text className="text-base font-sans-bold text-gray-950 mb-0.5">{t('onboarding.availabilityTitle')}</Text>
            <Text className="text-xs font-sans-medium text-gray-500 leading-tight">
              {t('onboarding.availabilitySubtitle')}
            </Text>
          </View>

          <View className="border-b border-gray-100 mb-4" />

          <AvailabilityEditor
            workingDays={workingDays}
            onChangeWorkingDays={setWorkingDays}
            workingHoursStart={workingHoursStart}
            workingHoursEnd={workingHoursEnd}
            onChangeHours={onChangeHours}
          />
        </View>
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <View
        className="bg-white border-t border-gray-100 px-5"
        style={{
          paddingTop: 12,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 0 : 10,
        }}
      >
        <Button
          title={t('onboarding.save')}
          onPress={onNext}
          variant="primary"
          size="md"
          className="w-full bg-primary"
        />
      </View>
    </View>
  );
}

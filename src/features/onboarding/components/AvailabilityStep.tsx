import React from 'react';
import { View } from 'react-native';
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
    <View className="flex-1 bg-secondary">
      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom + 80, 100),
        }}
      >
        {stepper && <View className="mb-6">{stepper}</View>}

        <AvailabilityEditor
          title={t('onboarding.availabilityTitle')}
          subtitle={t('onboarding.availabilitySubtitle')}
          workingDays={workingDays}
          onChangeWorkingDays={setWorkingDays}
          workingHoursStart={workingHoursStart}
          workingHoursEnd={workingHoursEnd}
          onChangeHours={onChangeHours}
        />
      </ContentLayout>

      {/* Sticky Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button title={t('common.continue')} variant="primary" size="lg" onPress={onNext} className="w-full" />
      </View>
    </View>
  );
}

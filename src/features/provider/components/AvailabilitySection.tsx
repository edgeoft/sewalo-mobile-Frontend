import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AvailabilityEditor from '@/components/common/AvailabilityEditor';

import type { AvailabilityType } from '@/constants/availability';

interface AvailabilitySectionProps {
  workingDays: AvailabilityType;
  onChangeWorkingDays: (days: AvailabilityType) => void;
  workingHoursStart: string;
  workingHoursEnd: string;
  onChangeHours: (start: string, end: string) => void;
  onSave: () => void;
  loading?: boolean;
}

export default function AvailabilitySection({
  workingDays,
  onChangeWorkingDays,
  workingHoursStart,
  workingHoursEnd,
  onChangeHours,
  onSave,
  loading = false,
}: AvailabilitySectionProps) {
  const { t } = useTranslation();

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
      <AvailabilityEditor
        workingDays={workingDays}
        onChangeWorkingDays={onChangeWorkingDays}
        workingHoursStart={workingHoursStart}
        workingHoursEnd={workingHoursEnd}
        onChangeHours={onChangeHours}
        title={t('provider.workingDays')}
        subtitle={t('provider.editProfileDesc')}
        onSave={onSave}
        saveButtonTitle={t('common.save')}
        loading={loading}
      />
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useSwitchRoleWithDetails, useUploadFile } from '@/api';
import { convertTimeTo24h } from '@/utils/time';
import { ROUTES } from '@/constants/routes';
import RadialStepper from '@/components/common/RadialStepper';
import { WORKING_DAYS_OPTIONS, WORKING_DAYS_MAPPING } from '@/constants/availability';

import AvailabilityStep from '@/features/onboarding/components/AvailabilityStep';
import IdentityVerificationStep from '@/features/onboarding/components/IdentityVerificationStep';

export default function BecomeProviderScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const { missingFields: missingFieldsRaw } = useLocalSearchParams<{ missingFields?: string }>();

  const missingFields: string[] = useMemo(() => {
    if (!missingFieldsRaw) return [];
    try {
      return JSON.parse(missingFieldsRaw);
    } catch {
      return [];
    }
  }, [missingFieldsRaw]);

  const isPartial = missingFields.length > 0;
  const needsAvailability =
    !isPartial ||
    ['availability', 'availability_days', 'start_time', 'end_time'].some((f) => missingFields.includes(f));
  const needsDocument = !isPartial || missingFields.includes('document');

  const [activeIndex, setActiveIndex] = useState(needsAvailability ? 1 : 2);
  const [workingDays, setWorkingDays] = useState<'everyday' | 'sunday_friday' | 'weekend'>('sunday_friday');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('06:00 PM');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: switchRoleWithDetails } = useSwitchRoleWithDetails();

  const totalSteps = (needsAvailability ? 1 : 0) + (needsDocument ? 1 : 0);

  const handleNext = () => {
    if (activeIndex === 1 && needsDocument) {
      setActiveIndex(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let documentPath = documentImage;

      if (
        documentImage?.startsWith('file://') ||
        documentImage?.startsWith('ph://') ||
        documentImage?.startsWith('content://')
      ) {
        const uploadRes = await uploadFile({ uri: documentImage, folder: 'document' });
        documentPath = uploadRes.path;
      }

      const mapped = WORKING_DAYS_MAPPING[workingDays];

      await switchRoleWithDetails({
        target_role: 'provider',
        availability: mapped.availability,
        availability_days: [...mapped.days],
        start_time: convertTimeTo24h(workingHoursStart),
        end_time: convertTimeTo24h(workingHoursEnd),
        document: documentPath || null,
      });

      showSnackbar({ message: 'Welcome to the partner network!', type: 'success' });
      router.replace(ROUTES.provider.home);
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (responseData?.missing_fields && Array.isArray(responseData.missing_fields)) {
        const missing = responseData.missing_fields as string[];
        const missingAvailability = ['availability', 'availability_days', 'start_time', 'end_time'].some((f) =>
          missing.includes(f),
        );
        const missingDocument = missing.includes('document');

        if (missingDocument) {
          setActiveIndex(missingAvailability ? 1 : 2);
        } else if (missingAvailability) {
          setActiveIndex(1);
        }

        showSnackbar({ message: `Missing: ${missing.join(', ')}`, type: 'error' });
      } else {
        const errMsg = err?.message || 'Failed to switch role.';
        showSnackbar({ message: errMsg, type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepperLabel = useMemo(() => {
    if (totalSteps === 1) {
      return needsDocument ? 'Identity Verification' : 'Availability';
    }
    return activeIndex === 1 ? 'Availability' : 'Identity Verification';
  }, [totalSteps, needsDocument, activeIndex]);

  const stepperSubtitle = useMemo(() => {
    if (totalSteps === 1) {
      return needsDocument ? 'Upload your ID document' : 'Set your weekly schedule';
    }
    return activeIndex === 1 ? 'Step 1 of 2: Weekly Schedule' : 'Step 2 of 2: ID Document';
  }, [totalSteps, needsDocument, activeIndex]);

  const stepper =
    totalSteps > 1 ? (
      <RadialStepper
        currentStep={activeIndex}
        totalSteps={totalSteps}
        label={stepperLabel}
        subtitle={stepperSubtitle}
        iconName={activeIndex === 1 ? 'calendar' : 'shield'}
        progressColor="#485aff"
        bgColor="#ffffff"
      />
    ) : null;

  return (
    <View className="flex-1 bg-secondary">
      <Header
        showBackButton
        variant="language"
        onBackPress={() => {
          if (activeIndex === 2 && needsAvailability) {
            setActiveIndex(1);
          } else {
            router.back();
          }
        }}
      />

      <View className="flex-1">
        {activeIndex === 1 && needsAvailability ? (
          <AvailabilityStep
            workingDays={workingDays}
            setWorkingDays={setWorkingDays}
            workingHoursStart={workingHoursStart}
            workingHoursEnd={workingHoursEnd}
            onChangeHours={(start, end) => {
              setWorkingHoursStart(start);
              setWorkingHoursEnd(end);
            }}
            onNext={handleNext}
            stepper={stepper}
          />
        ) : activeIndex === 2 && needsDocument ? (
          <IdentityVerificationStep
            documentImage={documentImage}
            setDocumentImage={setDocumentImage}
            onNext={handleSubmit}
            role="provider"
            stepper={stepper}
          />
        ) : null}
      </View>

      {submitting && (
        <View style={StyleSheet.absoluteFill} className="bg-black/25 justify-center items-center z-50">
          <View className="bg-white p-6 rounded-2xl shadow-xl items-center">
            <ActivityIndicator size="large" color="#485aff" />
            <Text className="text-sm font-sans-semibold text-gray-800 mt-3">Registering profile...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});

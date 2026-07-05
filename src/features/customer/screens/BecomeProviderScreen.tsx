import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useSwitchRoleWithDetails, useUploadFile } from '@/api';
import { convertTimeTo24h } from '@/utils/time';
import { ROUTES } from '@/constants/routes';
import RadialStepper from '@/components/common/RadialStepper';
import { WORKING_DAYS_OPTIONS, WORKING_DAYS_MAPPING } from '@/constants/availability';

// ponytail: Reuse existing onboarding step views directly to minimize code size
import AvailabilityStep from '@/features/onboarding/components/AvailabilityStep';
import IdentityVerificationStep from '@/features/onboarding/components/IdentityVerificationStep';

export default function BecomeProviderScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [activeIndex, setActiveIndex] = useState(1);
  const [workingDays, setWorkingDays] = useState<'everyday' | 'sunday_friday' | 'weekend'>('sunday_friday');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('06:00 PM');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutateAsync: switchRoleWithDetails } = useSwitchRoleWithDetails();

  const handleSubmit = async () => {
    if (!documentImage) {
      showSnackbar({ message: t('onboarding.uploadIdImage'), type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      let documentPath = documentImage;

      // ponytail: Upload document to backend S3 bucket if it is a local file URI
      if (
        documentImage.startsWith('file://') ||
        documentImage.startsWith('ph://') ||
        documentImage.startsWith('content://')
      ) {
        const uploadRes = await uploadFile({ uri: documentImage, folder: 'document' });
        documentPath = uploadRes.path;
      }

      // Map working days to API fields using centralized constants mapping
      const mapped = WORKING_DAYS_MAPPING[workingDays];

      await switchRoleWithDetails({
        target_role: 'provider',
        availability: mapped.availability,
        availability_days: [...mapped.days],
        start_time: convertTimeTo24h(workingHoursStart),
        end_time: convertTimeTo24h(workingHoursEnd),
        document: documentPath,
      });

      showSnackbar({ message: 'Welcome to the partner network!', type: 'success' });
      router.replace(ROUTES.provider.home);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to switch role.';
      showSnackbar({ message: errMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // RadialStepper component that gets injected into each step view
  const stepper = (
    <RadialStepper
      currentStep={activeIndex}
      totalSteps={2}
      label={activeIndex === 1 ? 'Availability' : 'Identity Verification'}
      subtitle={activeIndex === 1 ? 'Step 1 of 2: Weekly Schedule' : 'Step 2 of 2: ID Document'}
      iconName={activeIndex === 1 ? 'calendar' : 'shield'}
      progressColor="#485aff"
      bgColor="#ffffff"
    />
  );

  return (
    <View className="flex-1 bg-secondary">
      <Header
        showBackButton
        variant="language"
        onBackPress={() => {
          if (activeIndex === 2) {
            setActiveIndex(1);
          } else {
            router.back();
          }
        }}
      />

      <View className="flex-1">
        {activeIndex === 1 ? (
          <AvailabilityStep
            workingDays={workingDays}
            setWorkingDays={setWorkingDays}
            workingHoursStart={workingHoursStart}
            workingHoursEnd={workingHoursEnd}
            onChangeHours={(start, end) => {
              setWorkingHoursStart(start);
              setWorkingHoursEnd(end);
            }}
            onNext={() => setActiveIndex(2)}
            stepper={stepper}
          />
        ) : (
          <IdentityVerificationStep
            documentImage={documentImage}
            setDocumentImage={setDocumentImage}
            onNext={handleSubmit}
            onSkip={() => setActiveIndex(1)}
            role="provider"
            stepper={stepper}
          />
        )}
      </View>

      {/* Submitting Loading Overlay */}
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

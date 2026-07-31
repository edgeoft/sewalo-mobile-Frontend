import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';

interface ReportProblemFormData {
  category: string;
  subject: string;
  description: string;
  stepsToReproduce: string;
}

const useIssueCategories = () => {
  const { t } = useTranslation();
  return [
    { value: 'crash', label: t('settings.issueCrash') },
    { value: 'performance', label: t('settings.issuePerformance') },
    { value: 'payment', label: t('settings.issuePayment') },
    { value: 'account', label: t('settings.issueAccount') },
    { value: 'other', label: t('settings.issueOther') },
  ];
};

export default function ReportProblemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const ISSUE_CATEGORIES = useIssueCategories();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportProblemFormData>({
    defaultValues: {
      category: 'crash',
      subject: '',
      description: '',
      stepsToReproduce: '',
    },
  });

  const handleUploadScreenshot = () => {
    setScreenshotUploaded(true);
    showSnackbar({ message: t('settings.screenshotUploaded'), type: 'success' });
  };

  const handleReportSubmit = (data: ReportProblemFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showError({
        title: t('settings.problemReportedTitle'),
        message: t('settings.problemReportedMessage', {
          ticketId: '#BUG-' + Math.floor(1000 + Math.random() * 9000),
        }),
        actions: [
          {
            text: t('settings.return'),
            onPress: () => {
              reset();
              router.back();
            },
          },
        ],
      });
    }, 1500);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title={t('settings.reportProblemTitle')}
          description={t('settings.reportProblemDesc')}
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-4">
          {/* Category Selector */}
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{t('settings.problemType')}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <>
                  {ISSUE_CATEGORIES.map((cat) => {
                    const active = value === cat.value;
                    return (
                      <Pressable
                        key={cat.value}
                        onPress={() => onChange(cat.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className={`px-3 py-2 rounded-lg border ${
                          active ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text className={`text-[11px] font-sans-semibold ${active ? 'text-primary' : 'text-gray-500'}`}>
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </>
              )}
            />
          </View>

          {/* Subject Line */}
          <Controller
            control={control}
            name="subject"
            rules={{ required: t('settings.problemTitleRequired') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('settings.problemTitle')}
                placeholder={t('settings.problemTitlePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="mb-4"
                error={errors.subject?.message}
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            rules={{
              required: t('settings.descriptionRequired'),
              minLength: { value: 10, message: t('settings.descriptionMinLength') },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('settings.describeWhatHappened')}
                placeholder={t('settings.describePlaceholder')}
                multiline
                numberOfLines={4}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="mb-4"
                inputClassName="h-24 text-sm py-2"
                error={errors.description?.message}
              />
            )}
          />

          {/* Steps to Reproduce */}
          <Controller
            control={control}
            name="stepsToReproduce"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('settings.stepsToReproduce')}
                placeholder={t('settings.stepsToReproducePlaceholder')}
                multiline
                numberOfLines={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="mb-4"
                inputClassName="h-16 text-sm py-2"
              />
            )}
          />

          {/* Screenshot upload attachment */}
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
            {t('settings.attachScreenshot')}
          </Text>
          <Pressable
            onPress={handleUploadScreenshot}
            accessibilityRole="button"
            className={`border border-dashed rounded-lg py-3.5 mb-5 items-center justify-center flex-row ${
              screenshotUploaded ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-300 bg-white'
            }`}
          >
            <Feather
              name={screenshotUploaded ? 'check-circle' : 'image'}
              size={16}
              color={screenshotUploaded ? '#10b981' : '#64748b'}
              accessible={false}
            />
            <Text
              className={`text-xs font-sans-semibold ml-2 ${screenshotUploaded ? 'text-emerald-700' : 'text-gray-500'}`}
            >
              {screenshotUploaded ? t('settings.screenshotAttached') : t('settings.clickToUploadScreenshot')}
            </Text>
          </Pressable>

          {/* Submit */}
          <Button
            title={t('common.submit')}
            variant="primary"
            loading={loading}
            onPress={handleSubmit(handleReportSubmit)}
            className="w-full h-12"
          />
        </View>
      </ContentLayout>
    </View>
  );
}

import React from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { View, Text, Linking, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PhoneNumberField from '@/features/auth/components/PhoneNumberField';

import { useSubmitContact } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';
import { cardShadow } from '@/constants/shadows';

interface SupportTicketFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

const SUPPORT_NUMBERS = [
  {
    key: 'ntc',
    labelKey: 'settings.ntcSupport',
    phone: '9744985161',
  },
  {
    key: 'ncell',
    labelKey: 'settings.ncellSupport',
    phone: '9713969243',
  },
] as const;

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mutate: submitContact, isPending } = useSubmitContact();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      subject: '',
      message: '',
    },
  });

  const watchSubject = useWatch({ control, name: 'subject' }) || '';
  const watchMessage = useWatch({ control, name: 'message' }) || '';

  const handleCallSupport = (phoneNumber: string) => {
    Linking.openURL(`tel:+977${phoneNumber}`).catch(() => {
      showSnackbar({ message: t('settings.callNotSupported'), type: 'error' });
    });
  };

  const handleTicketSubmit = (data: SupportTicketFormData) => {
    submitContact(
      {
        name: data.fullName,
        email: data.email,
        phone_no: data.phoneNumber,
        subject: data.subject,
        message: data.message,
      },
      {
        onSuccess: (res) => {
          showSnackbar({
            message: t('settings.ticketCreated', {
              name: data.fullName,
              ticketId: '#SWL-' + (res.data?.id || Math.floor(100000 + Math.random() * 900000)),
              email: data.email,
            }),
            type: 'success',
            duration: 5000,
          });
          reset();
          router.back();
        },
        onError: (error) => {
          showSnackbar({
            message: error.message || t('settings.failedToSubmitContact'),
            type: 'error',
          });
        },
      },
    );
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
          title={t('settings.contactSupportTitle')}
          description={t('settings.contactSupportDesc')}
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Support channels dashboard */}
        <View className="flex-row gap-x-3 mb-6">
          {SUPPORT_NUMBERS.map((support) => (
            <Pressable
              key={support.key}
              onPress={() => handleCallSupport(support.phone)}
              accessibilityRole="button"
              accessibilityLabel={`${t(support.labelKey)}: ${support.phone}`}
              style={cardShadow}
              className="flex-1 min-h-[44px] bg-card rounded-xl p-4 items-center justify-center active:opacity-75"
            >
              <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mb-2">
                <Feather name="phone-call" size={18} color={THEME_COLORS.primary} accessible={false} />
              </View>
              <Text className="text-xs font-sans-bold text-foreground text-center">{t(support.labelKey)}</Text>
              <Text className="text-[10px] font-sans-medium text-muted-foreground text-center mt-1">
                {support.phone}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Contact Form Container */}
        <View style={cardShadow} className="bg-white rounded-xl p-5 mb-5">
          {/* Full Name Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              {t('settings.fullName')} <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="fullName"
              rules={{ required: t('settings.fullNameRequired') }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('settings.yourNamePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.fullName?.message}
                />
              )}
            />
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              {t('settings.email')} <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: t('settings.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('settings.invalidEmail'),
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('settings.emailPlaceholder')}
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.email?.message}
                />
              )}
            />
          </View>

          {/* Phone Number Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              {t('settings.phoneNumber')} <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label=""
              placeholder={t('settings.phonePlaceholder')}
              error={errors.phoneNumber?.message}
            />
          </View>

          {/* Subject Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              {t('settings.subject')} <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="subject"
              rules={{
                required: t('settings.subjectRequired'),
                maxLength: { value: 120, message: t('settings.subjectMaxLength') },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('settings.subjectPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={120}
                  inputStyle={{ padding: 0 }}
                  error={errors.subject?.message}
                />
              )}
            />
            <Text className="text-[10px] font-sans-medium text-gray-400 mt-1 ml-1">{watchSubject.length}/120</Text>
          </View>

          {/* Message Field */}
          <View className="mb-5">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              {t('settings.message')} <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="message"
              rules={{
                required: t('settings.messageRequired'),
                maxLength: { value: 2000, message: t('settings.messageMaxLength') },
                minLength: { value: 10, message: t('settings.messageMinLength') },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('settings.messagePlaceholder')}
                  multiline
                  numberOfLines={6}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={2000}
                  inputStyle={{ textAlignVertical: 'top', height: 140, padding: 0 }}
                  error={errors.message?.message}
                />
              )}
            />
            <Text className="text-[10px] font-sans-medium text-gray-400 mt-1 ml-1">{watchMessage.length}/2000</Text>
          </View>

          {/* Send Message Button */}
          <Button
            title={t('settings.sendMessage')}
            variant="primary"
            loading={isPending}
            onPress={handleSubmit(handleTicketSubmit)}
            className="w-full h-12 bg-primary border-primary rounded-xl"
            leftIcon={<Feather name="send" size={16} color={THEME_COLORS.primaryForeground} />}
          />
        </View>

        {/* Support hours notice */}
        <View className="mt-1 items-center justify-center">
          <Text className="text-[10px] font-sans-medium text-gray-400 text-center">{t('settings.supportHours')}</Text>
        </View>
      </ContentLayout>
    </View>
  );
}

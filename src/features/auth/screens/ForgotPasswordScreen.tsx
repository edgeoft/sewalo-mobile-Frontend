import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import AuthHeader from '../components/AuthHeader';
import { ForgotPasswordFormData, getForgotPasswordSchema } from '../data/schemas';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(getForgotPasswordSchema(t)),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/auth/otp-verification',
        params: { phone: data.phone, flow: 'forgot-password' },
      });
    }, 1200);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-secondary">
      <AuthHeader showBackButton />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 28,
        }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View className="flex-1 justify-start">
          {/* Title and Subtitle */}
          <View>
            <Text className="text-2xl font-sans-extrabold text-gray-900 text-left mb-1" style={{ letterSpacing: -0.8 }}>
              {t('auth.forgotPasswordTitle')}
            </Text>
            <Text className="text-sm font-sans-medium text-gray-500 text-left leading-5 mb-8">
              {t('auth.forgotPasswordSubtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-y-6">
            <View className="w-full">
              <Text className="text-sm font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{t('auth.mobileNumber')}</Text>
              <View
                className={`form-input-container ${
                  errors.phone ? 'form-input-container-error' : isPhoneFocused ? 'form-input-container-focus' : ''
                }`}
                style={{
                  shadowColor: isPhoneFocused ? '#485aff' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isPhoneFocused ? 0.08 : 0.015,
                  shadowRadius: isPhoneFocused ? 4 : 2,
                  elevation: isPhoneFocused ? 2 : 0,
                }}
              >
                <View className="flex-row items-center pr-2.5">
                  <Text className="text-base mr-1">🇳🇵</Text>
                  <Text className="text-sm font-sans-semibold text-gray-800">+977</Text>
                  <Feather name="chevron-down" size={14} color="#898f8f" style={{ marginLeft: 4 }} />
                </View>

                <View className="w-[1px] h-6 bg-gray-200 mr-3.5" />

                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur: fieldOnBlur, value } }) => (
                    <TextInput
                      placeholder={t('auth.enterMobileNumber')}
                      placeholderTextColor="#898f8f"
                      value={value}
                      onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => {
                        setIsPhoneFocused(false);
                        fieldOnBlur();
                      }}
                      keyboardType="phone-pad"
                      maxLength={10}
                      className="form-input-text"
                      style={{
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                        padding: 0,
                        lineHeight: undefined,
                      }}
                    />
                  )}
                />
              </View>
              {errors.phone?.message && (
                <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{errors.phone.message}</Text>
              )}
            </View>

            <Button
              title={t('auth.continue')}
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              className="w-full"
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

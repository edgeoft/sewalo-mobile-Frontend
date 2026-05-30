import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Checkbox from '@/components/Checkbox';
import Input from '@/components/Input';
import AuthHeader from '../components/AuthHeader';
import { getSigninSchema, SigninFormData } from '../data/schemas';

export default function SigninScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(getSigninSchema(t)),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = (data: SigninFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Sign in attempt successful!');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-secondary">
      <AuthHeader />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingBottom: Math.max(insets.bottom, 16),
          paddingTop: 28,
        }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View className="flex-1 justify-start">
          {/* Title and Subtitle Section */}
          <View className="mb-8">
            <Text className="text-2xl font-sans-extrabold text-gray-900 text-left mb-2" style={{ letterSpacing: -0.8 }}>
              {t('auth.loginIntoYourAccount')}
            </Text>
            <Text className="text-[14px] font-sans-medium text-gray-500 text-left leading-5">
              {t('auth.joinSewaloSubtitle')}
            </Text>
          </View>

          <View className="gap-y-3.5">
            <View className="w-full">
              <Text className="text-[13px] font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
                {t('auth.mobileNumber')}
              </Text>
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
                  <Text className="text-[14px] font-sans-semibold text-gray-800">+977</Text>
                  <Feather name="chevron-down" size={14} color="#898f8f" style={{ marginLeft: 4 }} />
                </View>

                <View className="w-[1px] h-6 bg-gray-200 mr-3.5" />

                {/* Phone Input Field */}
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
                    />
                  )}
                />
              </View>
              {errors.phone?.message && (
                <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{errors.phone.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.password')}
                  placeholder={t('auth.enterYourPassword')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  error={errors.password?.message}
                  rightIcon={
                    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8} className="active:opacity-60">
                      <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="#898f8f" />
                    </Pressable>
                  }
                />
              )}
            />

            <View className="flex-row justify-between items-center w-full mt-1 mb-2">
              <View className="flex-1 mr-2">
                <Checkbox
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label={t('auth.rememberMe')}
                  labelClassName="text-sm font-sans-semibold text-gray-800"
                />
              </View>
              <Pressable onPress={() => alert('Forgot Password pressed')} className="flex-shrink-0 active:opacity-60">
                <Text className="text-primary font-sans-semibold text-sm">{t('auth.forgetPassword')}</Text>
              </Pressable>
            </View>

            <View className="pt-2">
              <Button
                title={t('auth.login')}
                loading={loading}
                onPress={handleSubmit(onSubmit)}
                className="w-full"
                variant="primary"
              />
            </View>

            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-gray-500 font-sans-regular text-sm">{t('auth.dontHaveAccount')} </Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/auth',
                    params: { fromSignin: 'true' },
                  })
                }
              >
                <Text className="text-primary font-sans-bold text-sm">{t('auth.createAccount')}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-[13px] font-sans-medium text-gray-500 text-center leading-5">
            {t('auth.termsAndPrivacyPrefix')}{' '}
            <Text
              onPress={() => alert('Terms of Service pressed')}
              className="text-primary font-sans-semibold underline"
            >
              {t('auth.termsOfService')}
            </Text>
            {t('auth.and')}
            <Text onPress={() => alert('Privacy Policy pressed')} className="text-primary font-sans-semibold underline">
              {t('auth.privacyPolicy')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

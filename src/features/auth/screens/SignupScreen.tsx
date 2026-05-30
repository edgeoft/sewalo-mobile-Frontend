import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Checkbox from '@/components/Checkbox';
import Input from '@/components/Input';
import { UserRole } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthHeader from '../components/AuthHeader';
import { getSignupSchema, SignupFormData } from '../data/schemas';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role: UserRole }>();

  const selectedRole = role || 'customer';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(getSignupSchema(t)),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = (data: SignupFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Sign up attempt successful!');
    }, 1500);
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
          {/* Title and Hook Phrase Section */}
          <View className="mb-8">
            <Text
              className="text-2xl font-sans-extrabold text-gray-900 text-left mb-2.5"
              style={{ letterSpacing: -0.8 }}
            >
              {t('auth.joinSewalo')}
            </Text>
            <Text className="text-[14px] font-sans-medium text-gray-500 text-left leading-5">
              {selectedRole === 'provider' ? t('auth.signUpSubtitleProvider') : t('auth.signUpSubtitleCustomer')}
            </Text>
          </View>

          {/* Form Container */}
          <View className="gap-y-3.5">
            {/* Full Name Field */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.fullName')}
                  placeholder={t('auth.enterFullName')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            {/* Combined Mobile Number Field */}
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
                {/* Country Code Flag and Dropdown */}
                <View className="flex-row items-center pr-2.5">
                  <Text className="text-base mr-1">🇳🇵</Text>
                  <Text className="text-[14px] font-sans-semibold text-gray-800">+977</Text>
                  <Feather name="chevron-down" size={14} color="#898f8f" style={{ marginLeft: 4 }} />
                </View>

                {/* Vertical Divider */}
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

            {/* Password Field */}
            <View>
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
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={8}
                        className="active:opacity-60"
                      >
                        <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="#898f8f" />
                      </Pressable>
                    }
                  />
                )}
              />
            </View>

            {/* Confirm Password Field */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('auth.confirmPassword')}
                  placeholder={t('auth.enterConfirmPassword')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showConfirmPassword}
                  error={errors.confirmPassword?.message}
                  rightIcon={
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={8}
                      className="active:opacity-60"
                    >
                      <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={18} color="#898f8f" />
                    </Pressable>
                  }
                />
              )}
            />

            {/* Agree to terms checkbox */}
            <Controller
              control={control}
              name="agreeToTerms"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row items-center w-full mt-1.5">
                  <Checkbox
                    checked={value}
                    onChange={onChange}
                    label={
                      <Text className="text-sm font-sans-semibold text-gray-800 leading-4">
                        {t('auth.agreeToTermsPrefix')}
                        <Text onPress={() => alert('Terms of Service pressed')} className="text-primary underline">
                          {t('auth.termsOfService')}
                        </Text>
                        {t('auth.and')}
                        <Text onPress={() => alert('Privacy Policy pressed')} className="text-primary underline">
                          {t('auth.privacyPolicy')}
                        </Text>
                      </Text>
                    }
                  />
                </View>
              )}
            />
            {errors.agreeToTerms?.message && (
              <Text className="text-xs font-sans-medium text-destructive ml-1">{errors.agreeToTerms.message}</Text>
            )}

            {/* Signup Button Section */}
            <View className="pt-2">
              <Button
                title={t('auth.signUp')}
                loading={loading}
                onPress={handleSubmit(onSubmit)}
                className="w-full"
                variant="primary"
              />
            </View>

            {/* Already have an account & Login redirect */}
            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-gray-500 font-sans-regular text-sm">{t('auth.alreadyHaveAccount')} </Text>
              <Pressable onPress={() => router.replace('/auth/signin')}>
                <Text className="text-primary font-sans-bold text-sm">{t('auth.login')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

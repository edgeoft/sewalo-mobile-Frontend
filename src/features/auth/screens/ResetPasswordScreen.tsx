import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Input from '@/components/Input';
import AuthHeader from '../components/AuthHeader';
import { getResetPasswordSchema, ResetPasswordFormData } from '../data/schemas';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(getResetPasswordSchema(t)),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordValue);

  const getRequirementStyle = (isMet: boolean) => {
    if (passwordValue.length === 0) {
      return { icon: 'circle' as const, color: '#898f8f', textClass: 'text-gray-500 font-sans-medium' };
    }
    if (isMet) {
      return { icon: 'check-circle' as const, color: '#10b981', textClass: 'text-emerald-600 font-sans-medium' };
    }
    return { icon: 'circle' as const, color: '#ef4444', textClass: 'text-destructive font-sans-medium' };
  };

  const onSubmit = (data: ResetPasswordFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(t('auth.passwordResetSuccess'));
      // Replace layout state to Signin screen
      router.replace('/auth/signin');
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
          {/* Title and Subtitle */}
          <View>
            <Text className="text-2xl font-sans-extrabold text-gray-900 text-left mb-1" style={{ letterSpacing: -0.8 }}>
              {t('auth.resetPasswordTitle')}
            </Text>
            <Text className="text-sm font-sans-medium text-gray-500 text-left leading-5 mb-8">
              {t('auth.resetPasswordSubtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-y-4">
            {/* New Password Field */}
            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.newPassword')}
                    placeholder={t('auth.enterNewPassword')}
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

              {/* Requirements indicator checklist */}
              <View className="mt-2 px-0.5 gap-y-1">
                <Text className="text-xs font-sans-bold text-gray-500 mb-0.5">
                  {t('auth.passwordRequirementsTitle')}
                </Text>
                <View className="flex-row items-center">
                  <Feather
                    name={getRequirementStyle(hasMinLength).icon}
                    size={11}
                    color={getRequirementStyle(hasMinLength).color}
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`text-xs ${getRequirementStyle(hasMinLength).textClass}`}>
                    {t('auth.passwordRequirementLength')}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Feather
                    name={getRequirementStyle(hasUppercase).icon}
                    size={11}
                    color={getRequirementStyle(hasUppercase).color}
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`text-xs ${getRequirementStyle(hasUppercase).textClass}`}>
                    {t('auth.passwordRequirementUppercase')}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Feather
                    name={getRequirementStyle(hasNumber).icon}
                    size={11}
                    color={getRequirementStyle(hasNumber).color}
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`text-xs ${getRequirementStyle(hasNumber).textClass}`}>
                    {t('auth.passwordRequirementNumber')}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Feather
                    name={getRequirementStyle(hasSpecialChar).icon}
                    size={11}
                    color={getRequirementStyle(hasSpecialChar).color}
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`text-xs ${getRequirementStyle(hasSpecialChar).textClass}`}>
                    {t('auth.passwordRequirementSpecial')}
                  </Text>
                </View>
              </View>
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

            <View className="pt-2">
              <Button
                title={t('auth.resetPasswordTitle')}
                loading={loading}
                onPress={handleSubmit(onSubmit)}
                className="w-full"
                variant="primary"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

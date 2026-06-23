import React from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import PasswordField from '../components/PasswordField';
import EnhancedPasswordRequirements from '../components/EnhancedPasswordRequirements';
import { getChangePasswordSchema, ChangePasswordFormData } from '@/schemas/auth';

import { useChangePassword } from '@/api';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mutate: changePassword, isPending } = useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(getChangePasswordSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword' }) ?? '';

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        old_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      },
      {
        onSuccess: () => {
          Alert.alert(t('success') || 'Success', t('auth.passwordChangedSuccess'), [
            {
              text: t('ok') || 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert(
            t('error') || 'Error',
            error.message || t('auth.passwordChangeFailed') || 'Failed to change password',
          );
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
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title={t('auth.changePassword')}
          description={t('auth.changePasswordSubtitle')}
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View className="gap-y-4 bg-white border border-gray-200 rounded-xl p-4">
          <PasswordField
            control={control}
            name="currentPassword"
            label={t('auth.currentPassword')}
            placeholder={t('auth.enterCurrentPassword')}
            error={errors.currentPassword?.message}
          />

          <View>
            <PasswordField
              control={control}
              name="newPassword"
              label={t('auth.newPassword')}
              placeholder={t('auth.enterNewPassword')}
              error={errors.newPassword?.message}
            />

            <EnhancedPasswordRequirements
              password={newPasswordValue}
              labels={{
                title: t('auth.passwordRequirementsTitle'),
                length: t('auth.passwordRequirementLength'),
                uppercase: t('auth.passwordRequirementUppercase'),
                number: t('auth.passwordRequirementNumber'),
                special: t('auth.passwordRequirementSpecial'),
                strength: t('auth.passwordStrength'),
                strengthWeak: t('auth.passwordStrengthWeak'),
                strengthMedium: t('auth.passwordStrengthMedium'),
                strengthStrong: t('auth.passwordStrengthStrong'),
              }}
            />
          </View>

          <PasswordField
            control={control}
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            placeholder={t('auth.enterConfirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button
            title={t('auth.changePassword')}
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
            className="w-full mt-4"
          />
        </View>
      </ContentLayout>
    </View>
  );
}

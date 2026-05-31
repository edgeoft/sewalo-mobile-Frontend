import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import AuthScreenLayout from '../components/AuthScreenLayout';
import PasswordField from '../components/PasswordField';
import PasswordRequirements from '../components/PasswordRequirements';
import { getResetPasswordSchema, ResetPasswordFormData } from '../data/schemas';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(getResetPasswordSchema(t)),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(t('auth.passwordResetSuccess'));
      router.replace(ROUTES.auth.signin);
    }, 1500);
  };

  return (
    <AuthScreenLayout title={t('auth.resetPasswordTitle')} subtitle={t('auth.resetPasswordSubtitle')} showBackButton>
      <View className="gap-y-4">
        <View>
          <PasswordField
            control={control}
            name="password"
            label={t('auth.newPassword')}
            placeholder={t('auth.enterNewPassword')}
            error={errors.password?.message}
          />
          <PasswordRequirements
            password={passwordValue}
            labels={{
              title: t('auth.passwordRequirementsTitle'),
              length: t('auth.passwordRequirementLength'),
              uppercase: t('auth.passwordRequirementUppercase'),
              number: t('auth.passwordRequirementNumber'),
              special: t('auth.passwordRequirementSpecial'),
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

        <View className="pt-2">
          <Button
            title={t('auth.resetPasswordTitle')}
            loading={loading}
            onPress={handleSubmit(onSubmit)}
            className="w-full"
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

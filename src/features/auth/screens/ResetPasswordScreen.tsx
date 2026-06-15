import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import AuthScreenLayout from '../components/AuthScreenLayout';
import PasswordField from '../components/PasswordField';
import PasswordRequirements from '../components/PasswordRequirements';
import { getResetPasswordSchema, ResetPasswordFormData } from '../data/schemas';
import { useResetPassword } from '../api/hooks';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone, otp } = useLocalSearchParams<{ phone: string; otp: string }>();
  const resetPasswordMutation = useResetPassword();

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

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate({
      phone: phone || '',
      otp: otp || '',
      password: data.password,
      password_confirmation: data.confirmPassword,
    });
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
            loading={resetPasswordMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="w-full"
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

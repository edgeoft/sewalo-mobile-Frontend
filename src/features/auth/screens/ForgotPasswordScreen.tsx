import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import AuthScreenLayout from '../components/AuthScreenLayout';
import PhoneNumberField from '../components/PhoneNumberField';
import { ForgotPasswordFormData, getForgotPasswordSchema } from '../data/schemas';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        pathname: ROUTES.auth.otpVerification,
        params: { phone: data.phone, flow: 'forgot-password' },
      });
    }, 1200);
  };

  return (
    <AuthScreenLayout title={t('auth.forgotPasswordTitle')} subtitle={t('auth.forgotPasswordSubtitle')} showBackButton>
      <View className="gap-y-6">
        <PhoneNumberField
          control={control}
          name="phone"
          label={t('auth.mobileNumber')}
          placeholder={t('auth.enterMobileNumber')}
          error={errors.phone?.message}
        />

        <Button title={t('auth.continue')} loading={loading} onPress={handleSubmit(onSubmit)} className="w-full" />
      </View>
    </AuthScreenLayout>
  );
}

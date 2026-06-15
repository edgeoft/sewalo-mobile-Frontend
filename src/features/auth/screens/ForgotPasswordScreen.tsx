import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import AuthScreenLayout from '../components/AuthScreenLayout';
import PhoneNumberField from '../components/PhoneNumberField';
import { ForgotPasswordFormData, getForgotPasswordSchema } from '../data/schemas';

import { useForgotPassword } from '../api/hooks';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const forgotPasswordMutation = useForgotPassword();

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
    forgotPasswordMutation.mutate({ phone: data.phone });
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

        <Button
          title={t('auth.continue')}
          loading={forgotPasswordMutation.isPending}
          onPress={handleSubmit(onSubmit)}
          className="w-full"
        />
      </View>
    </AuthScreenLayout>
  );
}

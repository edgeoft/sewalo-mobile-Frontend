import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { UserRole, USER_ROLES } from '@/types';
import AuthFooterLink from '../components/AuthFooterLink';
import AuthScreenLayout from '../components/AuthScreenLayout';
import PasswordField from '../components/PasswordField';
import PasswordRequirements from '../components/PasswordRequirements';
import PhoneNumberField from '../components/PhoneNumberField';
import { getSignupSchema, SignupFormData } from '@/schemas/auth';
import { useSignup } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: UserRole }>();

  const { showSnackbar } = useSnackbar();
  const selectedRole = role || USER_ROLES.Customer;
  const signupMutation = useSignup();

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

  const passwordValue = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({
      name: data.name,
      phone: data.phone,
      password: data.password,
      password_confirmation: data.confirmPassword,
      role: selectedRole,
    });
  };

  return (
    <AuthScreenLayout
      title={t('auth.joinSewalo')}
      subtitle={
        selectedRole === USER_ROLES.Provider ? t('auth.signUpSubtitleProvider') : t('auth.signUpSubtitleCustomer')
      }
      showBackButton
    >
      <View className="gap-y-2.5">
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

        <PhoneNumberField
          control={control}
          name="phone"
          label={t('auth.mobileNumber')}
          placeholder={t('auth.enterMobileNumber')}
          error={errors.phone?.message}
        />

        <View>
          <PasswordField
            control={control}
            name="password"
            label={t('auth.password')}
            placeholder={t('auth.enterYourPassword')}
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

        <Controller
          control={control}
          name="agreeToTerms"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row items-center w-full mt-1.5">
              <Checkbox
                checked={value}
                onChange={onChange}
                size="sm"
                label={
                  <Text className="text-sm font-sans-semibold text-gray-800 leading-5">
                    {t('auth.agreeToTermsPrefix')}
                    <Text
                      onPress={() => showSnackbar({ message: 'Terms of Service pressed', type: 'info' })}
                      className="text-primary underline"
                    >
                      {t('auth.termsOfService')}
                    </Text>
                    {` ${t('auth.and')} `}
                    <Text
                      onPress={() => showSnackbar({ message: 'Privacy Policy pressed', type: 'info' })}
                      className="text-primary underline"
                    >
                      {t('auth.privacyPolicy')}
                    </Text>
                  </Text>
                }
              />
            </View>
          )}
        />
        {errors.agreeToTerms?.message ? (
          <Text className="text-xs font-sans-medium text-destructive ml-1">{errors.agreeToTerms.message}</Text>
        ) : null}

        <View className="gap-y-1.5 mt-2">
          <Button
            title={t('auth.signUp')}
            loading={signupMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="w-full"
          />
          <AuthFooterLink
            prompt={t('auth.alreadyHaveAccount')}
            actionLabel={t('auth.login')}
            onPress={() => router.replace(ROUTES.auth.signin)}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

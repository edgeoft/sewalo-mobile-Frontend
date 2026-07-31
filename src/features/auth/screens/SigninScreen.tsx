import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { getSigninSchema, SigninFormData } from '@/schemas/auth';
import AuthFooterLink from '../components/AuthFooterLink';
import AuthScreenLayout from '../components/AuthScreenLayout';
import PasswordField from '../components/PasswordField';
import PhoneNumberField from '../components/PhoneNumberField';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES, USER_STATUSES } from '@/types';

import { useLogin } from '@/api';

export default function SigninScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setRole } = useAuth();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.status === USER_STATUSES.Pending) {
        router.replace({
          pathname: ROUTES.auth.gettingStarted,
          params: { role, phone: user.phone },
        });
      } else {
        if (role === USER_ROLES.Provider) {
          router.replace(ROUTES.provider.home);
        } else {
          router.replace(ROUTES.customer.home);
        }
      }
    }
  }, [isLoggedIn, role, user, router]);

  const [rememberMe, setRememberMe] = useState(false);
  const loginMutation = useLogin();

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
    loginMutation.mutate({
      phone: data.phone,
      password: data.password,
    });
  };

  return (
    <AuthScreenLayout
      title={t('auth.loginIntoYourAccount')}
      subtitle={t('auth.signInSubtitle')}
      justifyContent="space-between"
      bottomPadding={16}
    >
      <View className="gap-y-2.5">
        <PhoneNumberField
          control={control}
          name="phone"
          label={t('auth.mobileNumber')}
          placeholder={t('auth.enterMobileNumber')}
          error={errors.phone?.message}
        />

        <PasswordField
          control={control}
          name="password"
          label={t('auth.password')}
          placeholder={t('auth.enterYourPassword')}
          error={errors.password?.message}
        />

        <View className="flex-row justify-between items-center w-full mt-1 mb-2">
          <View className="flex-1 mr-2">
            <Checkbox
              checked={rememberMe}
              onChange={setRememberMe}
              label={t('auth.rememberMe')}
              labelClassName="text-sm font-sans-semibold text-gray-800"
              size="sm"
            />
          </View>
          <Pressable
            onPress={() => router.push(ROUTES.auth.forgotPassword)}
            className="flex-shrink-0 active:opacity-60"
            accessibilityRole="button"
          >
            <Text className="text-primary font-sans-semibold text-sm">{t('auth.forgetPassword')}</Text>
          </Pressable>
        </View>

        <View className="pt-2">
          <Button
            title={t('auth.login')}
            loading={loginMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="w-full"
          />
        </View>

        <View className="flex-row items-center my-3">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="text-xs font-sans-bold text-gray-400 px-3 uppercase">{t('auth.or')}</Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        <Button
          title={t('auth.continueAsGuest')}
          onPress={() => {
            setRole(USER_ROLES.Guest);
            router.replace(ROUTES.guest.home);
          }}
          className="w-full border border-gray-300 bg-white active:bg-gray-50"
          textClassName="text-gray-800 font-sans-semibold"
          variant="ghost"
        />

        <View className="mt-2">
          <AuthFooterLink
            prompt={t('auth.dontHaveAccount')}
            actionLabel={t('auth.createAccount')}
            onPress={() =>
              router.push({
                pathname: ROUTES.auth.roleSelection,
                params: { fromSignin: 'true' },
              })
            }
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}

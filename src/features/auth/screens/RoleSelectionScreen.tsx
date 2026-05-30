import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import { USER_ROLES, UserRole } from '@/types';
import AuthHeader from '../components/AuthHeader';
import RoleCard from '../components/RoleCard';
import RoleIllustrationIcon from '../components/icons/RoleIllustrationIcon';

export default function RoleSelectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { fromSignin } = useLocalSearchParams<{ fromSignin: string }>();
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.Customer);

  const handleContinue = () => {
    router.push({ pathname: '/auth/signup', params: { role: selectedRole } });
  };
  return (
    <View className="flex-1 bg-secondary">
      <AuthHeader showBackButton={fromSignin === 'true'} />
      <View className="flex-1 px-6 pt-6 pb-8 justify-between">
        <View>
          <Text className="text-2xl font-sans-extrabold text-gray-900 mb-1" style={{ letterSpacing: -0.8 }}>
            {t('auth.roleSelectionTitle')}
          </Text>
          <Text className="text-sm font-sans-regular text-gray-500 mb-8">{t('auth.roleSelectionSubtitle')}</Text>

          <View style={{ gap: 12 }}>
            <RoleCard
              title={t('auth.customerRoleTitle')}
              subtitle={t('auth.customerRoleSubtitle')}
              description={t('auth.customerRoleDescription')}
              selected={selectedRole === USER_ROLES.Customer}
              onPress={() => setSelectedRole(USER_ROLES.Customer)}
              illustration={<RoleIllustrationIcon variant="customer" active={selectedRole === USER_ROLES.Customer} />}
            />
            <RoleCard
              title={t('auth.providerRoleTitle')}
              subtitle={t('auth.providerRoleSubtitle')}
              description={t('auth.providerRoleDescription')}
              selected={selectedRole === USER_ROLES.Provider}
              onPress={() => setSelectedRole(USER_ROLES.Provider)}
              illustration={<RoleIllustrationIcon variant="provider" active={selectedRole === USER_ROLES.Provider} />}
            />
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 24 }}>
          <Button
            title={selectedRole === USER_ROLES.Customer ? t('auth.joinAsCustomer') : t('auth.joinAsProvider')}
            onPress={handleContinue}
          />
          <View className="flex-row items-center justify-center mt-1">
            <Text className="text-gray-600 font-sans-regular text-sm">{t('auth.alreadyHaveAccount')} </Text>
            <Pressable onPress={() => router.replace('/auth/signin')}>
              <Text className="text-primary font-sans-bold text-sm">{t('auth.login')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

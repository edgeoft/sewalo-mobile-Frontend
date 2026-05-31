import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import SelectionOption from '@/components/SelectionOption';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES, UserRole } from '@/types';
import AuthHeader from '../components/AuthHeader';

export default function GettingStartedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.Customer);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    router.push({
      pathname: ROUTES.auth.signup,
      params: { role: selectedRole },
    });
  };

  return (
    <View className="flex-1 bg-secondary">
      <AuthHeader />
      <View className="flex-1 px-6 pt-8 pb-8 justify-between">
        <View>
          <Text className="text-2xl font-sans-extrabold text-gray-900 text-left mb-1" style={{ letterSpacing: -0.8 }}>
            {t('auth.roleSelectionTitle')}
          </Text>
          <Text className="text-sm font-sans-regular text-gray-500 text-left mb-8">
            {t('auth.roleSelectionSubtitle')}
          </Text>

          <View className="gap-y-3">
            <SelectionOption
              title={t('auth.customerRoleTitle')}
              subtitle={t('auth.customerRoleSubtitle')}
              selected={selectedRole === USER_ROLES.Customer}
              onPress={() => handleSelectRole(USER_ROLES.Customer)}
              icon={
                <Feather
                  name="shopping-bag"
                  size={18}
                  color={selectedRole === USER_ROLES.Customer ? '#485aff' : '#64748b'}
                />
              }
            />

            <SelectionOption
              title={t('auth.providerRoleTitle')}
              subtitle={t('auth.providerRoleSubtitle')}
              selected={selectedRole === USER_ROLES.Provider}
              onPress={() => handleSelectRole(USER_ROLES.Provider)}
              icon={
                <Feather name="tool" size={18} color={selectedRole === USER_ROLES.Provider ? '#485aff' : '#64748b'} />
              }
            />
          </View>
        </View>

        <View className="gap-y-4">
          <Button
            title={selectedRole === USER_ROLES.Customer ? t('auth.joinAsCustomer') : t('auth.joinAsProvider')}
            onPress={handleContinue}
          />

          <View className="flex-row items-center justify-center mt-2">
            <Text className="text-gray-600 font-sans-regular text-sm">{t('auth.alreadyHaveAccount')} </Text>
            <Pressable onPress={() => router.push(ROUTES.auth.signin)}>
              <Text className="text-primary font-sans-bold text-sm">{t('auth.login')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { createGuestDrawerConfig } from '@/components/navigation/RoleDrawerConfig';
import SideDrawer from '@/components/navigation/SideDrawer';
import { ROUTES } from '@/constants/routes';
import AuthFooterLink from '@/features/auth/components/AuthFooterLink';
import GuestFeatureCard from '../components/GuestFeatureCard';
import GuestRoleActionCard from '../components/GuestRoleActionCard';

export default function GuestGetStartedScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const drawerConfig = createGuestDrawerConfig({
    currentLanguage: i18n.language || 'en',
    onLanguageChange: (code) => i18n.changeLanguage(code),
  });

  const handleJoinRole = (role: 'customer' | 'provider') => {
    router.push({
      pathname: ROUTES.auth.signup,
      params: { role },
    });
  };

  const features = [
    {
      icon: 'shield' as const,
      color: '#10b981',
      title: t('auth.getStarted.verifiedProsTitle'),
      description: t('auth.getStarted.verifiedProsDesc'),
    },
    {
      icon: 'zap' as const,
      color: '#f59e0b',
      title: t('auth.getStarted.instantBookingTitle'),
      description: t('auth.getStarted.instantBookingDesc'),
    },
    {
      icon: 'lock' as const,
      color: '#485aff',
      title: t('auth.getStarted.safePayoutsTitle'),
      description: t('auth.getStarted.safePayoutsDesc'),
    },
  ];

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" onMenuPress={() => setDrawerVisible(true)} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 20,
        }}
      >
        <View className="mb-6">
          <Text className="text-2xl font-sans-extrabold text-gray-900 mb-1.5 tracking-tight">
            {t('auth.getStarted.welcomeTitle')}
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-relaxed">
            {t('auth.getStarted.welcomeSubtitle')}
          </Text>
        </View>

        <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3.5 ml-1">
          {t('auth.getStarted.agnosticTitle')}
        </Text>

        <View className="gap-y-4 mb-6">
          <GuestRoleActionCard
            variant="primary"
            title={t('auth.getStarted.needServiceTitle')}
            description={t('auth.getStarted.needServiceDesc')}
            onPress={() => handleJoinRole('customer')}
          />

          <GuestRoleActionCard
            variant="outline"
            title={t('auth.getStarted.wantEarnTitle')}
            description={t('auth.getStarted.wantEarnDesc')}
            onPress={() => handleJoinRole('provider')}
          />
        </View>

        <View className="gap-y-4 mb-6">
          {features.map((item) => (
            <GuestFeatureCard
              key={item.title}
              icon={item.icon}
              color={item.color}
              title={item.title}
              description={item.description}
            />
          ))}
        </View>

        <View className="mt-auto">
          <AuthFooterLink
            prompt={t('auth.alreadyHaveAccount')}
            actionLabel={t('auth.login')}
            onPress={() => router.push(ROUTES.auth.signin)}
            size="xs"
          />
        </View>
      </ContentLayout>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="Menu"
        sections={drawerConfig.sections}
        footerAction={drawerConfig.footerAction}
      />
    </View>
  );
}

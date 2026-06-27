import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';

import GuestFeatureCard from '../components/GuestFeatureCard';
import GuestRoleActionCard from '../components/GuestRoleActionCard';
import AccountMenuItem from '@/features/customer/components/AccountMenuItem';

export default function GuestGetStartedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      <Header variant="menu" />

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

          <GuestRoleActionCard
            variant="outline"
            title={t('auth.alreadyHaveAccount')}
            description={t('auth.signinToAccess')}
            onPress={() => router.push(ROUTES.auth.signin)}
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

        {/* Support & Information Section */}
        <View
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 1,
          }}
          className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6"
        >
          <View className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
            <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider">
              {t('navigation.supportAndInfo')}
            </Text>
          </View>
          <AccountMenuItem
            icon="star"
            title={t('navigation.rateApp')}
            subtitle={t('navigation.rateAppSubtitle')}
            onPress={() => router.push(ROUTES.guest.rateApp)}
          />
          <AccountMenuItem
            icon="info"
            title={t('navigation.aboutSewalo')}
            subtitle={t('navigation.aboutSewaloSubtitle')}
            onPress={() => router.push(ROUTES.guest.aboutSewalo)}
          />
          <AccountMenuItem
            icon="shield"
            title={t('navigation.privacyPolicy')}
            subtitle={t('navigation.privacyPolicySubtitle')}
            onPress={() => router.push(ROUTES.guest.privacyPolicy)}
          />
          <AccountMenuItem
            icon="file-text"
            title={t('navigation.termsAndConditions')}
            subtitle={t('navigation.termsAndConditionsSubtitle')}
            onPress={() => router.push(ROUTES.guest.termsOfService)}
          />
          <AccountMenuItem
            icon="alert-triangle"
            title={t('navigation.reportProblem')}
            subtitle={t('navigation.reportProblemSubtitle')}
            onPress={() => router.push(ROUTES.guest.reportProblem)}
          />
          <AccountMenuItem
            icon="message-circle"
            title={t('navigation.contactSupport')}
            subtitle={t('navigation.contactSupportSubtitle')}
            onPress={() => router.push(ROUTES.guest.contactSupport)}
          />
        </View>
      </ContentLayout>
    </View>
  );
}

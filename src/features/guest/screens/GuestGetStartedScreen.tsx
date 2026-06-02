import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View, Alert } from 'react-native';
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
            description="Sign in to access your saved profile and active bookings"
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
              Support & Information
            </Text>
          </View>
          <AccountMenuItem
            icon="star"
            title="Rate the app"
            subtitle="Share your feedback"
            onPress={() => Alert.alert('Rate App', 'Thank you for your rating!')}
          />
          <AccountMenuItem
            icon="info"
            title="About Sewalo"
            subtitle="Learn more about the app"
            onPress={() => Alert.alert('About App', 'Sewalo Mobile version 1.0.0')}
          />
          <AccountMenuItem
            icon="shield"
            title="Privacy policy"
            subtitle="Read how your data is handled"
            onPress={() => Alert.alert('Privacy Policy', 'Display privacy statement.')}
          />
          <AccountMenuItem
            icon="file-text"
            title="Terms & conditions"
            subtitle="Review usage terms"
            onPress={() => Alert.alert('Terms & Conditions', 'Display user agreement.')}
          />
          <AccountMenuItem
            icon="alert-triangle"
            title="Report a problem"
            subtitle="Send an issue or bug report"
            onPress={() => Alert.alert('Report Problem', 'Send bug report forms.')}
          />
          <AccountMenuItem
            icon="message-circle"
            title="Contact support"
            subtitle="Reach the Sewalo support team"
            onPress={() => Alert.alert('Contact Support', 'Connecting to support chat...')}
          />
        </View>
      </ContentLayout>
    </View>
  );
}

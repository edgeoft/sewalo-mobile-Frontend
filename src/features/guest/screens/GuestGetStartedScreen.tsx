import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuthHeader from '@/features/auth/components/AuthHeader';

export default function GuestGetStartedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleJoinRole = (role: 'customer' | 'provider') => {
    router.push({
      pathname: '/auth/signup',
      params: { role },
    });
  };

  const features = [
    {
      icon: 'shield' as const,
      color: '#10b981', // emerald
      title: t('auth.getStarted.verifiedProsTitle'),
      description: t('auth.getStarted.verifiedProsDesc'),
    },
    {
      icon: 'zap' as const,
      color: '#f59e0b', // amber
      title: t('auth.getStarted.instantBookingTitle'),
      description: t('auth.getStarted.instantBookingDesc'),
    },
    {
      icon: 'lock' as const,
      color: '#485aff', // brand primary
      title: t('auth.getStarted.safePayoutsTitle'),
      description: t('auth.getStarted.safePayoutsDesc'),
    },
  ];

  return (
    <View className="flex-1 bg-secondary">
      <AuthHeader />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-2xl font-sans-extrabold text-gray-900 mb-1.5 tracking-tight">
            {t('auth.getStarted.welcomeTitle')}
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-relaxed">
            {t('auth.getStarted.welcomeSubtitle')}
          </Text>
        </View>

        {/* Feature Highlights (Description Section) */}
        <View className="gap-y-4 mb-6">
          {features.map((item, idx) => (
            <View
              key={idx}
              className="flex-row items-start bg-white p-4 rounded-xl border border-gray-100/80"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <Feather name={item.icon} size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-sans-bold text-gray-900 mb-0.5">{item.title}</Text>
                <Text className="text-xs font-sans-medium text-gray-500 leading-relaxed">{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Simple Agnostic Title */}
        <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3.5 ml-1">
          {t('auth.getStarted.agnosticTitle')}
        </Text>

        {/* Interactive Funnel Cards */}
        <View className="gap-y-4 mb-6">
          <Pressable
            onPress={() => handleJoinRole('customer')}
            className="w-full flex-row items-center justify-between bg-primary p-5 rounded-xl active:opacity-90 shadow-sm"
          >
            <View className="flex-1 mr-4">
              <Text className="text-base font-sans-bold text-white mb-0.5">
                {t('auth.getStarted.needServiceTitle')}
              </Text>
              <Text className="text-xs font-sans-medium text-white/80 leading-normal">
                {t('auth.getStarted.needServiceDesc')}
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
              <Feather name="chevron-right" size={18} color="white" />
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleJoinRole('provider')}
            className="w-full flex-row items-center justify-between bg-white border border-primary p-5 rounded-xl active:opacity-90"
          >
            <View className="flex-1 mr-4">
              <Text className="text-base font-sans-bold text-primary mb-0.5">{t('auth.getStarted.wantEarnTitle')}</Text>
              <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
                {t('auth.getStarted.wantEarnDesc')}
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Feather name="chevron-right" size={18} color="#485aff" />
            </View>
          </Pressable>
        </View>

        {/* Footer SignIn redirection link */}
        <View className="flex-row items-center justify-center mt-auto">
          <Text className="text-gray-500 font-sans-regular text-xs">{t('auth.alreadyHaveAccount')} </Text>
          <Pressable onPress={() => router.push('/auth/signin')}>
            <Text className="text-primary font-sans-bold text-xs">{t('auth.login')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

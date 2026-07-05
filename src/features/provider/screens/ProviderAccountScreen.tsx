import { useRouter } from 'expo-router';
import { Image, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { useSwitchRole } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';

import AccountMenuSectionCard from '@/features/customer/components/AccountMenuSectionCard';
import { Feather } from '@expo/vector-icons';
import { getProviderAccountMenu } from '../constants/accountMenu';
import { getImageUrl } from '../../auth/utils/image';

export default function ProviderAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const { mutateAsync: switchRole, isPending: isSwitching } = useSwitchRole();

  const menuSections = getProviderAccountMenu(t, user);

  const handleEditProfile = () => {
    router.push(ROUTES.provider.editProfile);
  };

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.auth.signin);
  };

  const handleSwitchRole = async () => {
    try {
      await switchRole({ target_role: 'customer' });
      showSnackbar({ message: 'Switched to customer account', type: 'success' });
      router.replace(ROUTES.customer.home);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to switch role.';
      showSnackbar({ message: errMsg, type: 'error' });
    }
  };

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        handleEditProfile();
        break;
      case 'payout-accounts':
        router.push(ROUTES.provider.payoutAccounts);
        break;
      case 'verification-documents':
        router.push(ROUTES.provider.verificationDocuments);
        break;
      case 'notification-settings':
        router.push(ROUTES.provider.notificationSettings);
        break;
      case 'privacy-settings':
        router.push(ROUTES.provider.privacySettings);
        break;
      case 'change-password':
        router.push(ROUTES.provider.changePassword);
        break;
      case 'help-faq':
        router.push(ROUTES.provider.helpFaq);
        break;
      case 'contact-support':
        router.push(ROUTES.provider.contactSupport);
        break;
      case 'terms-of-service':
        router.push(ROUTES.provider.termsOfService);
        break;
      case 'privacy-policy':
        router.push(ROUTES.provider.privacyPolicy);
        break;
      case 'my-reviews':
        router.push(ROUTES.provider.myReviews);
        break;
      case 'rate-app':
        router.push(ROUTES.provider.rateApp);
        break;
      case 'switch-role':
        handleSwitchRole();
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  return (
    <View className="flex-1 bg-secondary">
      {/* Header with notifications icon */}
      <Header
        variant="menu"
        showNotifications
        showNotificationBadge
        onNotificationsPress={() => router.push(ROUTES.notifications)}
      />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        {/* Title */}
        <SectionHeader
          title={t('provider.accountMenuTitle')}
          description={t('provider.accountMenuDesc')}
          className="mb-5"
          titleClassName="text-2xl"
        />

        {/* 1. Partner Profile Card */}
        <View
          style={cardShadow}
          className="rounded-xl border border-gray-200 bg-white p-4 mb-5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <View className="relative">
              <Image
                source={
                  user?.avatar ? { uri: getImageUrl(user.avatar) } : require('@/assets/images/avatar-default.png')
                }
                className="h-16 w-16 rounded-full border border-gray-100 bg-gray-50"
                resizeMode="cover"
              />
              {user?.status === 'verified' && (
                <View className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-blue-500 border-2 border-white items-center justify-center">
                  <Feather name="check" size={10} color="#ffffff" />
                </View>
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-sans-extrabold text-gray-900 leading-5">
                {user?.name || t('provider.partner')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                {user?.email || t('provider.noEmail')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                {user?.phone || t('provider.noPhone')}
              </Text>

              {/* Rating */}
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <View className="flex-row items-center gap-0.5">
                  <Feather name="star" size={10} color="#f59e0b" />
                  <Text className="text-[10px] font-sans-bold text-gray-600">
                    {Number(user?.average_rating || user?.avg_rating || 0).toFixed(1)}
                  </Text>
                  <Text className="text-[10px] font-sans-medium text-gray-400">
                    ({user?.total_ratings || (user?.avg_rating ? 1 : 0)})
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Settings Categories (Config Driven) */}
        <View className="gap-y-5">
          {menuSections.map((section) => (
            <AccountMenuSectionCard
              key={section.title}
              section={section}
              onItemPress={handleItemPress}
              rightContentMap={{
                language: <LanguageSelector />,
              }}
            />
          ))}
        </View>
      </ContentLayout>
      {isSwitching && (
        <View style={StyleSheet.absoluteFill} className="bg-black/25 justify-center items-center z-50">
          <View className="bg-white p-6 rounded-2xl shadow-xl items-center">
            <ActivityIndicator size="large" color="#485aff" />
            <Text className="text-sm font-sans-semibold text-gray-800 mt-3">Switching account...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

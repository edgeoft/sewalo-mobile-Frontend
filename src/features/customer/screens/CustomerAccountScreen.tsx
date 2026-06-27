import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { SectionHeader } from '@/components/common';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';

import LoyaltyPointsCard from '../components/LoyaltyPointsCard';
import AccountMenuSectionCard from '../components/AccountMenuSectionCard';
import { getCustomerAccountMenu } from '../constants/accountMenu';
import { getImageUrl } from '../../auth/utils/image';

export default function CustomerAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const menuSections = getCustomerAccountMenu(t);

  const handleEditProfile = () => {
    router.push(ROUTES.customer.editProfile);
  };

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.auth.signin);
  };

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        handleEditProfile();
        break;
      case 'my-reviews':
        router.push(ROUTES.customer.myReviews);
        break;
      case 'identity-verification':
        router.push(ROUTES.customer.identityVerification);
        break;
      case 'refer-friend':
        router.push(ROUTES.customer.referFriend);
        break;
      case 'notification-settings':
        router.push(ROUTES.customer.notificationSettings);
        break;
      case 'privacy-settings':
        router.push(ROUTES.customer.privacySettings);
        break;
      case 'change-password':
        router.push(ROUTES.customer.changePassword);
        break;
      case 'help-faq':
        router.push(ROUTES.customer.helpFaq);
        break;
      case 'contact-support':
        router.push(ROUTES.customer.contactSupport);
        break;
      case 'terms-of-service':
        router.push(ROUTES.customer.termsOfService);
        break;
      case 'privacy-policy':
        router.push(ROUTES.customer.privacyPolicy);
        break;
      case 'rate-app':
        router.push(ROUTES.customer.rateApp);
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
    elevation: 1,
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
          title={t('customer.accountMenuTitle')}
          description={t('customer.accountMenuDesc')}
          className="mb-5"
          titleClassName="text-2xl"
        />

        {/* 1. Profile Summary Card */}
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
              <View className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-emerald-500 border-2 border-white items-center justify-center" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-sans-extrabold text-gray-900 leading-5">
                {user?.name || t('customer.guestUser')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                {user?.email || t('customer.noEmail')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                {user?.phone || t('customer.noPhone')}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Loyalty Points Card */}
        <LoyaltyPointsCard points={user?.loyalty_points ?? 0} />

        {/* 3. Settings Categories (Config Driven) */}
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
    </View>
  );
}

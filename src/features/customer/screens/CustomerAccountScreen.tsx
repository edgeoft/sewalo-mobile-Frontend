import React from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { SectionHeader } from '@/components/common';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';

import LoyaltyPointsCard from '../components/LoyaltyPointsCard';
import AccountMenuSectionCard from '../components/AccountMenuSectionCard';
import { CUSTOMER_ACCOUNT_MENU } from '../constants/accountMenu';

export default function CustomerAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleEditProfile = () => {
    router.push(ROUTES.customer.editProfile);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/signin');
        },
      },
    ]);
  };

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        handleEditProfile();
        break;
      case 'my-reviews':
        Alert.alert('My Reviews', 'Opening list of your reviews.');
        break;
      case 'identity-verification':
        Alert.alert('Identity Verification', 'Upload verification documents.');
        break;
      case 'refer-friend':
        Alert.alert('Refer a Friend', 'Share your referral code: SEWALO50');
        break;
      case 'notification-settings':
        Alert.alert('Notification Settings', 'Update preferences.');
        break;
      case 'privacy-settings':
        Alert.alert('Privacy Settings', 'Update privacy settings.');
        break;
      case 'change-password':
        Alert.alert('Change Password', 'Reset credential forms.');
        break;
      case 'help-faq':
        Alert.alert('Help & FAQ', 'Open support articles.');
        break;
      case 'contact-support':
        Alert.alert('Contact Support', 'Submit custom support ticket.');
        break;
      case 'terms-of-service':
        Alert.alert('Terms of Service', 'Display legal agreement.');
        break;
      case 'privacy-policy':
        Alert.alert('Privacy Policy', 'Display privacy statement.');
        break;
      case 'rate-app':
        Alert.alert('Rate App', 'Thank you for your rating!');
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
      <Header variant="menu" showNotifications onNotificationsPress={() => router.push(ROUTES.notifications)} />

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
          title="Account"
          description="Manage your profile, rewards, and app settings."
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
                source={{ uri: 'https://i.pravatar.cc/300?img=11' }}
                className="h-16 w-16 rounded-full border border-gray-100 bg-gray-50"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-emerald-500 border-2 border-white items-center justify-center" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-sans-extrabold text-gray-900 leading-5">Aayush Shrestha</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">aayush.shrestha@gmail.com</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">+977 9801234567</Text>
            </View>
          </View>
        </View>

        {/* 2. Loyalty Points Card */}
        <LoyaltyPointsCard points={2450} />

        {/* 3. Settings Categories (Config Driven) */}
        <View className="gap-y-5">
          {CUSTOMER_ACCOUNT_MENU.map((section) => (
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

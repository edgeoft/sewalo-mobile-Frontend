import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { USER_ROLES } from '@/constants/roles';
import { AccountMenuItemId } from '@/types';
import { useAccountActions } from '@/hooks/useAccountActions';

import AccountMenuSectionCard from '@/features/customer/components/AccountMenuSectionCard';
import AccountProfileCard from '@/features/customer/components/AccountProfileCard';
import ProfileCompletionCard from '@/components/common/ProfileCompletionCard';
import { getProviderAccountMenu } from '../constants/accountMenu';

export default function ProviderAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { isSwitching, handleSwitchRole, handleItemNavigation } = useAccountActions();

  const menuSections = getProviderAccountMenu(t, user);

  const handleItemPress = (itemId: AccountMenuItemId) => {
    if (itemId === 'switch-role') {
      handleSwitchRole(USER_ROLES.Customer);
    } else {
      const allItems = menuSections.flatMap((section) => section.items);
      const matchedItem = allItems.find((item) => item.id === itemId);
      handleItemNavigation(itemId, matchedItem?.route);
    }
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

        {/* 1. Profile Card */}
        <AccountProfileCard user={user} role={USER_ROLES.Provider} />

        {/* 2. Profile Completion Tracker Card */}
        <ProfileCompletionCard />

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
            <Text className="text-sm font-sans-semibold text-gray-800 mt-3">Switching profile...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

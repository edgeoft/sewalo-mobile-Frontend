import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { LoadingOverlay } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { USER_ROLES } from '@/constants/roles';
import { AccountMenuItemId } from '@/types';
import { useAccountActions } from '@/hooks/useAccountActions';

import AccountMenuSectionCard from '../components/AccountMenuSectionCard';
import LoyaltyPointsCard from '../components/LoyaltyPointsCard';
import AccountProfileCard from '../components/AccountProfileCard';
import { getCustomerAccountMenu } from '../constants/accountMenu';

export default function CustomerAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { isSwitching, handleSwitchRole, handleItemNavigation } = useAccountActions();

  const menuSections = getCustomerAccountMenu(t, user);

  const handleItemPress = (itemId: AccountMenuItemId) => {
    if (itemId === 'switch-role') {
      handleSwitchRole(USER_ROLES.Provider);
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
          title={t('customer.accountMenuTitle')}
          description={t('customer.accountMenuDesc')}
          className="mb-5"
          titleClassName="text-2xl"
        />

        {/* 1. Profile Summary Card */}
        <AccountProfileCard user={user} role={USER_ROLES.Customer} />

        {/* 2. Loyalty Points Card */}
        <LoyaltyPointsCard points={user?.loyalty_points ?? 0} />

        {/* 3. Settings Categories (Config Driven) */}
        <View className="gap-y-5">
          {menuSections.map((section) => (
            <AccountMenuSectionCard
              key={section.title}
              section={section}
              onItemPress={(id) => handleItemPress(id as AccountMenuItemId)}
              rightContentMap={{
                language: <LanguageSelector />,
              }}
            />
          ))}
        </View>
      </ContentLayout>
      <LoadingOverlay visible={isSwitching} message="Switching profile..." />
    </View>
  );
}

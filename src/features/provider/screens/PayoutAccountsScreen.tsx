import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

import PayoutAccountsManager from '../components/PayoutAccountsManager';

export default function PayoutAccountsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <PayoutAccountsManager
          header={
            <SectionHeader
              title="Payout Accounts"
              description="Manage your bank accounts and digital wallets for service payout transfers."
              className="flex-1"
              titleClassName="text-2xl text-gray-950 font-sans-extrabold"
            />
          }
        />
      </ContentLayout>
    </View>
  );
}

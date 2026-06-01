import { useRouter } from 'expo-router';
import ContentLayout from '@/components/layout/ContentLayout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { createRoleDrawerConfig } from '@/components/navigation/RoleDrawerConfig';
import SideDrawer from '@/components/navigation/SideDrawer';

export default function ProviderHomeScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const drawerConfig = createRoleDrawerConfig({
    currentLanguage: i18n.language || 'en',
    onLanguageChange: (code) => i18n.changeLanguage(code),
    onLogout: () => setDrawerVisible(false),
  });

  return (
    <ContentLayout className="flex-1 bg-secondary">
      <DashboardTopBar
        showNotifications
        onNotificationsPress={() => router.push('/notifications')}
        onMenuPress={() => setDrawerVisible(true)}
      />

      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-sans-bold text-gray-900">Provider Home Screen</Text>
      </View>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="Menu"
        sections={drawerConfig.sections}
        footerAction={drawerConfig.footerAction}
      />
    </ContentLayout>
  );
}

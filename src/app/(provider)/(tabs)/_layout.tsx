import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';

function ProviderTabBar(props: BottomTabBarProps) {
  return <BottomNavigationBar {...props} />;
}

export default function ProviderLayout() {
  const renderTabBar = useCallback((props: BottomTabBarProps) => <ProviderTabBar {...props} />, []);
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="earnings" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';

function GuestTabBar(props: BottomTabBarProps) {
  return <BottomNavigationBar {...props} />;
}

export default function GuestLayout() {
  const renderTabBar = useCallback((props: BottomTabBarProps) => <GuestTabBar {...props} />, []);
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="find-services" />
      <Tabs.Screen name="map-services" />
      <Tabs.Screen name="be-provider" />
      <Tabs.Screen name="get-started" />
    </Tabs>
  );
}

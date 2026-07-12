import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';

function CustomerTabBar(props: BottomTabBarProps) {
  return <BottomNavigationBar {...props} />;
}

export default function CustomerLayout() {
  const renderTabBar = useCallback((props: BottomTabBarProps) => <CustomerTabBar {...props} />, []);
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="find-services" />
      <Tabs.Screen name="map-services" />
      <Tabs.Screen name="favourites" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

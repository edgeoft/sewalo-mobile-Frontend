import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';
import { Tabs } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerLayout() {
  const insets = useSafeAreaInsets();
  const renderTabBar = useCallback((props: BottomTabBarProps) => <BottomNavigationBar {...props} />, []);
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        sceneStyle: {
          backgroundColor: '#f1f5f9',
        },
        tabBarStyle: {
          height: 56 + insets.bottom,
        },
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

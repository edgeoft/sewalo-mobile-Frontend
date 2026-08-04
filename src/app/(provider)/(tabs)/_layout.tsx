import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';
import { Tabs } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProviderLayout() {
  const insets = useSafeAreaInsets();
  const renderTabBar = useCallback((props: BottomTabBarProps) => <BottomNavigationBar {...props} />, []);
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: '#f1f5f9',
        },
        tabBarStyle: {
          height: 56 + insets.bottom,
        },
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

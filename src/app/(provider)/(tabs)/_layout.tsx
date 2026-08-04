import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';

function ProviderTabBar(props: BottomTabBarProps) {
  return <BottomNavigationBar {...props} />;
}

export default function ProviderLayout() {
  const insets = useSafeAreaInsets();
  const renderTabBar = useCallback((props: BottomTabBarProps) => <ProviderTabBar {...props} />, []);
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
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

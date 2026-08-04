import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavigationBar, { type BottomTabBarProps } from '@/components/navigation/BottomNavigationBar';

function GuestTabBar(props: BottomTabBarProps) {
  return <BottomNavigationBar {...props} />;
}

export default function GuestLayout() {
  const insets = useSafeAreaInsets();
  const renderTabBar = useCallback((props: BottomTabBarProps) => <GuestTabBar {...props} />, []);
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
      <Tabs.Screen name="find-services" />
      <Tabs.Screen name="map-services" />
      <Tabs.Screen name="be-provider" />
      <Tabs.Screen name="get-started" />
    </Tabs>
  );
}

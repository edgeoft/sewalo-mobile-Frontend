import { Tabs } from 'expo-router';
import BottomNavigationBar from '@/components/navigation/BottomNavigationBar';

export default function GuestLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigationBar {...props} />}
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

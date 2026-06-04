import BottomNavigationBar from '@/components/navigation/BottomNavigationBar';
import { Tabs } from 'expo-router';

export default function ProviderLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigationBar {...props} />}
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

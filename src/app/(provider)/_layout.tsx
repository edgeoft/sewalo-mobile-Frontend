import { Tabs } from 'expo-router';
import BottomNavigationBar from '@/components/navigation/BottomNavigationBar';

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

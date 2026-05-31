import { Tabs } from 'expo-router';
import BottomNavigationBar from '@/components/navigation/BottomNavigationBar';

export default function CustomerLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="find-services" />
      <Tabs.Screen name="favourites" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

import { ScrollView, View } from 'react-native';

import HomeTopSection from '@/components/home/HomeTopSection';

export default function GuestHomeScreen() {
  return (
    <View className="flex-1 bg-secondary">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <HomeTopSection variant="guest" />
      </ScrollView>
    </View>
  );
}

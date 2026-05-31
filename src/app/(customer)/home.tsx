import { ScrollView, View } from 'react-native';

import HomeTopSection from '@/components/HomeTopSection';

export default function CustomerHomeScreen() {
  return (
    <View className="flex-1 bg-secondary">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <HomeTopSection variant="customer" />
      </ScrollView>
    </View>
  );
}

import { Link } from 'expo-router';
import { SafeAreaView, Text, View } from 'react-native';

export default function AuthScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold text-blue-600 text-center">Sign in</Text>
        <Text className="mt-4 text-base text-blue-600 text-center">
          Minimal auth screen. Authentication fields will be added later.
        </Text>

        <View className="mt-6">
          <Link href="/" asChild>
            <Text className="text-blue-600 text-center">Back to onboarding</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

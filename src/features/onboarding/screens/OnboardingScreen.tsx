import { Link } from 'expo-router';
import { SafeAreaView, Text, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold text-blue-600 text-center">
          minimal onboarding screen. Tap below to continue to authentication.
        </Text>

        <View className="mt-6">
          <Link href={'/auth' as never} asChild>
            <Text className="text-blue-600 text-center">Go to auth</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

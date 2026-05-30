import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import Button from '@/components/Button';
import AuthHeader from '../components/AuthHeader';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-secondary">
      <AuthHeader />
      <View className="flex-1 justify-center px-6 pb-12">
        <Text className="text-3xl font-sans-bold text-gray-900 mb-2">Create Account</Text>
        <Text className="text-gray-600 font-sans-regular mb-8">Sign up to get started.</Text>

        <View className="gap-y-4">
          <Button
            title="Back to Getting Started"
            variant="outline"
            textClassName="text-gray-800"
            className="border-gray-300"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}

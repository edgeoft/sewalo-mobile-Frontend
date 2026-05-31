import { Text, View } from 'react-native';

interface BeProviderStepCardProps {
  step: string;
  title: string;
  description: string;
}

export default function BeProviderStepCard({ step, title, description }: BeProviderStepCardProps) {
  return (
    <View className="flex-row items-start rounded-xl border border-gray-200 bg-white p-4">
      <View className="h-8 w-8 rounded-lg bg-secondary border border-gray-200 items-center justify-center mr-4">
        <Text className="text-xs font-sans-extrabold text-primary">{step}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-sans-bold text-gray-900 mb-1">{title}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-5">{description}</Text>
      </View>
    </View>
  );
}

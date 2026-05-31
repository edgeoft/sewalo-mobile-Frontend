import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Text, View } from 'react-native';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface GuestFeatureCardProps {
  icon: FeatherIconName;
  color: string;
  title: string;
  description: string;
}

export default function GuestFeatureCard({ icon, color, title, description }: GuestFeatureCardProps) {
  return (
    <View
      className="flex-row items-start bg-white p-4 rounded-xl border border-gray-100/80"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <Feather name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-sans-bold text-gray-900 mb-0.5">{title}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-relaxed">{description}</Text>
      </View>
    </View>
  );
}

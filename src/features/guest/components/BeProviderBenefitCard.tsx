import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Text, View } from 'react-native';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface BeProviderBenefitCardProps {
  icon: FeatherIconName;
  color: string;
  title: string;
  description: string;
}

export default function BeProviderBenefitCard({ icon, color, title, description }: BeProviderBenefitCardProps) {
  return (
    <View className="w-full rounded-xl border border-gray-100/80 bg-white p-4">
      <View
        className="h-10 w-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Feather name={icon} size={19} color={color} />
      </View>
      <Text className="text-sm font-sans-bold text-gray-900 mb-1">{title}</Text>
      <Text className="text-xs font-sans-medium text-gray-500 leading-5">{description}</Text>
    </View>
  );
}

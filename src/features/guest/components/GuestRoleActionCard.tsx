import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface GuestRoleActionCardProps {
  title: string;
  description: string;
  variant: 'primary' | 'outline';
  onPress: () => void;
}

export default function GuestRoleActionCard({ title, description, variant, onPress }: GuestRoleActionCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      className={`w-full flex-row items-center justify-between p-5 rounded-xl active:opacity-90 ${
        isPrimary ? 'bg-primary shadow-sm' : 'bg-white border border-primary'
      }`}
    >
      <View className="flex-1 mr-4">
        <Text className={`text-base font-sans-bold mb-0.5 ${isPrimary ? 'text-white' : 'text-primary'}`}>{title}</Text>
        <Text className={`text-xs font-sans-medium leading-normal ${isPrimary ? 'text-white/80' : 'text-gray-500'}`}>
          {description}
        </Text>
      </View>
      <View
        className={`w-8 h-8 rounded-full items-center justify-center ${isPrimary ? 'bg-white/20' : 'bg-primary/10'}`}
      >
        <Feather name="chevron-right" size={18} color={isPrimary ? 'white' : '#485aff'} />
      </View>
    </Pressable>
  );
}

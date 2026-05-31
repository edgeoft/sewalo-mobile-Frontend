import { Pressable, Text, View } from 'react-native';

interface AuthFooterLinkProps {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
  size?: 'xs' | 'sm';
}

export default function AuthFooterLink({ prompt, actionLabel, onPress, size = 'sm' }: AuthFooterLinkProps) {
  const textSizeClassName = size === 'xs' ? 'text-xs' : 'text-sm';

  return (
    <View className="flex-row items-center justify-center">
      <Text className={`text-gray-500 font-sans-regular ${textSizeClassName}`}>{prompt} </Text>
      <Pressable onPress={onPress}>
        <Text className={`text-primary font-sans-bold ${textSizeClassName}`}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

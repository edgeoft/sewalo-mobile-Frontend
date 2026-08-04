import { Pressable, Text } from 'react-native';

interface HomeTopSectionServiceChipProps {
  label: string;
  onPress?: () => void;
}

export default function HomeTopSectionServiceChip({ label, onPress }: HomeTopSectionServiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="rounded-full bg-white border border-gray-100 px-3 py-1 active:opacity-80"
    >
      <Text className="text-xs font-sans-semibold text-primary">{label}</Text>
    </Pressable>
  );
}

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
      className="rounded-full bg-white px-3 py-1 active:opacity-80"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 0,
      }}
    >
      <Text className="text-xs font-sans-semibold text-primary">{label}</Text>
    </Pressable>
  );
}

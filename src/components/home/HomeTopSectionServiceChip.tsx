import { Pressable, Text } from 'react-native';

interface HomeTopSectionServiceChipProps {
  label: string;
}

export default function HomeTopSectionServiceChip({ label }: HomeTopSectionServiceChipProps) {
  return (
    <Pressable
      className="rounded-full bg-white px-4 py-1.5 active:opacity-80"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text className="text-sm font-sans-semibold text-primary">{label}</Text>
    </Pressable>
  );
}

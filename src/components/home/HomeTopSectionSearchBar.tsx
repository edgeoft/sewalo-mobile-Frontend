import { Feather } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import Input from '@/components/ui/Input';

interface HomeTopSectionSearchBarProps {
  placeholder: string;
  onPress: () => void;
}

export default function HomeTopSectionSearchBar({ placeholder, onPress }: HomeTopSectionSearchBarProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <View
        pointerEvents="none"
        style={{
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 0,
        }}
      >
        <Input
          placeholder={placeholder}
          editable={false}
          inputClassName="text-sm font-sans-medium text-gray-500"
          rightIcon={<Feather name="search" size={20} color="#485aff" />}
        />
      </View>
    </Pressable>
  );
}

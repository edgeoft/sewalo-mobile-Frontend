import { Feather } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import Input from '@/components/ui/Input';
import { THEME_COLORS } from '@/constants/colors';

interface HomeTopSectionSearchBarProps {
  placeholder: string;
  onPress: () => void;
}

export default function HomeTopSectionSearchBar({ placeholder, onPress }: HomeTopSectionSearchBarProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <View pointerEvents="none" className="rounded-xl">
        <Input
          placeholder={placeholder}
          editable={false}
          inputClassName="text-sm font-sans-medium text-gray-500"
          rightIcon={<Feather name="search" size={20} color={THEME_COLORS.primary} />}
        />
      </View>
    </Pressable>
  );
}

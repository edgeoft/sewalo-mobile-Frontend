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
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={placeholder}>
      <View pointerEvents="none">
        <Input
          placeholder={placeholder}
          editable={false}
          inputClassName="text-[13px] font-sans-medium text-gray-500"
          rightIcon={<Feather name="search" size={20} color={THEME_COLORS.primary} />}
        />
      </View>
    </Pressable>
  );
}

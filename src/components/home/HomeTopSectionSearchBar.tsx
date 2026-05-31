import { Feather } from '@expo/vector-icons';
import Input from '@/components/ui/Input';

interface HomeTopSectionSearchBarProps {
  placeholder: string;
  onPress: () => void;
}

export default function HomeTopSectionSearchBar({ placeholder, onPress }: HomeTopSectionSearchBarProps) {
  return (
    <Input
      placeholder={placeholder}
      editable={false}
      pointerEvents="none"
      onPressIn={onPress}
      leftIcon={null}
      rightIcon={<Feather name="search" size={20} color="#485aff" />}
      className="h-14"
      inputClassName="text-sm font-sans-medium text-gray-500"
      containerStyle={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4,
      }}
    />
  );
}

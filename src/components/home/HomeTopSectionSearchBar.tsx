import SearchBar from '@/components/ui/SearchBar';

interface HomeTopSectionSearchBarProps {
  placeholder: string;
  onPress: () => void;
}

export default function HomeTopSectionSearchBar({ placeholder, onPress }: HomeTopSectionSearchBarProps) {
  return (
    <SearchBar
      placeholder={placeholder}
      editable={false}
      onPress={onPress}
      iconPosition="right"
      inputClassName="text-[13px] text-gray-500"
    />
  );
}

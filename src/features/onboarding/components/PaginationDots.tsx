import { View } from 'react-native';

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
}

export default function PaginationDots({ count, activeIndex }: PaginationDotsProps) {
  return (
    <View className="flex-row items-center justify-center" accessibilityRole="tablist">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            accessible
            accessibilityRole="tab"
            accessibilityLabel={`Page ${index + 1} of ${count}`}
            accessibilityState={{ selected: isActive }}
            className={`h-1.5 w-1.5 rounded-full mx-1 transition-all duration-300 ${
              isActive ? 'bg-white' : 'bg-white/40'
            }`}
          />
        );
      })}
    </View>
  );
}

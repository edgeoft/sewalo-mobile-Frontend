import { Pressable, Text, View } from 'react-native';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  containerClassName?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onValueChange,
  containerClassName = '',
}: SegmentedControlProps<T>) {
  return (
    <View
      className={`p-1 bg-gray-200/50 rounded-lg flex-row self-start ${containerClassName}`}
      accessibilityRole="radiogroup"
    >
      {options.map((option) => {
        const isActive = selectedValue === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onValueChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isActive }}
            className={`px-6 py-1.5 rounded-lg items-center justify-center flex-row ${
              isActive ? 'bg-white' : 'bg-transparent'
            }`}
            style={
              isActive
                ? {
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 0,
                  }
                : undefined
            }
          >
            <Text
              className={`text-xs ${isActive ? 'font-sans-bold text-gray-950' : 'font-sans-semibold text-gray-500'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DeliveryOptionCardProps {
  label: string;
  sublabel: string;
  selected: boolean;
  onPress: () => void;
  iconName: React.ComponentProps<typeof Feather>['name'];
}

export default function DeliveryOptionCard({ label, sublabel, selected, onPress, iconName }: DeliveryOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`p-2.5 px-3 rounded-xl border flex-row items-center justify-between mb-2 ${
        selected ? 'border-primary bg-indigo-50/10' : 'border-gray-200 bg-white'
      }`}
      style={
        selected
          ? {
              shadowColor: '#485aff',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 2,
              elevation: 0,
            }
          : undefined
      }
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className={`h-7.5 w-7.5 rounded-full items-center justify-center mr-2.5 ${
            selected ? 'bg-primary/10' : 'bg-gray-50'
          }`}
        >
          <Feather name={iconName} size={14} color={selected ? '#485aff' : '#64748b'} accessible={false} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-sans-bold text-gray-950">{label}</Text>
          <Text className="text-[10px] font-sans-medium text-gray-500 mt-0.5 leading-3">{sublabel}</Text>
        </View>
      </View>
      <View
        className={`w-4 h-4 rounded border items-center justify-center ${
          selected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
        }`}
      >
        {selected && <Feather name="check" size={9} color="white" accessible={false} />}
      </View>
    </Pressable>
  );
}

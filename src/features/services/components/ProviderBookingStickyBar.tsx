import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';

interface ProviderBookingStickyBarProps {
  selectedCount: number;
  totalPrice: number;
  onBookPress: () => void;
}

export default function ProviderBookingStickyBar({
  selectedCount,
  totalPrice,
  onBookPress,
}: ProviderBookingStickyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex-row items-center justify-between"
      style={[styles.shadowLg, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View>
        <Text className="text-xs font-sans-medium text-gray-500">{selectedCount} services selected</Text>
        <Text className="text-lg font-sans-extrabold text-primary">Rs. {totalPrice.toLocaleString()}</Text>
      </View>
      <Button
        title="Book Selected"
        variant="primary"
        onPress={onBookPress}
        className="px-6 py-2.5 rounded-xl"
        leftIcon={<Feather name="calendar" size={16} color="white" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowLg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
});

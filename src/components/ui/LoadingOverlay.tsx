import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="bg-black/25 justify-center items-center z-50"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
      accessibilityLiveRegion="polite"
      accessibilityViewIsModal
    >
      <View className="bg-white p-6 rounded-2xl shadow-xl items-center">
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        {message && <Text className="text-sm font-sans-semibold text-gray-800 mt-3">{message}</Text>}
      </View>
    </View>
  );
}

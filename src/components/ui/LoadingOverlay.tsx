import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';
import Spinner from './Spinner';

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
      <View className="bg-card p-6 rounded-2xl shadow-xl items-center border border-border">
        <Spinner size="blocking" color={THEME_COLORS.primary} />
        {message && <Text className="text-sm font-sans-semibold text-foreground mt-3">{message}</Text>}
      </View>
    </View>
  );
}

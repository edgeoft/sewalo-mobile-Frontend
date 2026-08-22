import { ActivityIndicator, View } from 'react-native';

import { THEME_COLORS } from '@/constants/colors';

export interface LoadingStateProps {
  className?: string;
  color?: string;
}

/** Centered full-area loading spinner. Replaces the 30+ hand-rolled copies. */
export default function LoadingState({ className = 'flex-1 items-center justify-center', color }: LoadingStateProps) {
  return (
    <View className={className}>
      <ActivityIndicator size="large" color={color ?? THEME_COLORS.primary} />
    </View>
  );
}

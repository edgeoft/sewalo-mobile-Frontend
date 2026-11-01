import { View } from 'react-native';

import { THEME_COLORS } from '@/constants/colors';
import Spinner, { type SpinnerSize } from './Spinner';

export interface LoadingStateProps {
  className?: string;
  color?: string;
  size?: SpinnerSize | number;
  label?: string;
}

/** Centered full-area loading spinner using the calibrated Mobile Loader Kit Spinner. */
export default function LoadingState({
  className = 'flex-1 items-center justify-center',
  color = THEME_COLORS.primary,
  size = 'refresh',
  label = 'Loading',
}: LoadingStateProps) {
  return (
    <View className={className}>
      <Spinner size={size} color={color} label={label} />
    </View>
  );
}

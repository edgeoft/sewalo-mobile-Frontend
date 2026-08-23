import React from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { THEME_COLORS } from '@/constants/colors';

export interface StarRatingProps {
  /** Current rating value (0–max). */
  value: number;
  max?: number;
  size?: number;
  readOnly?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  /** Fill the active stars (used by large interactive pickers). */
  fillActive?: boolean;
  className?: string;
  /** Classes applied to each star's touchable wrapper in interactive mode. */
  starClassName?: string;
  onPress?: (star: number) => void;
  onPressIn?: (star: number) => void;
  onPressOut?: (star: number) => void;
}

const DEFAULT_ACCESSIBILITY_LABEL = (star: number) => `Rate ${star} ${star === 1 ? 'star' : 'stars'}`;

/**
 * Star row used for both read-only display and interactive pickers.
 */
export default function StarRating({
  value,
  max = 5,
  size = 14,
  readOnly = false,
  activeColor = THEME_COLORS.amberStar,
  inactiveColor = THEME_COLORS.slate300,
  fillActive = false,
  className = 'flex-row items-center gap-0.5',
  starClassName = 'p-1',
  onPress,
  onPressIn,
  onPressOut,
}: StarRatingProps) {
  return (
    <View className={className}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        if (readOnly) {
          return <Feather key={star} name="star" size={size} color={star <= value ? activeColor : inactiveColor} />;
        }
        return (
          <Pressable
            key={star}
            onPress={() => onPress?.(star)}
            onPressIn={() => onPressIn?.(star)}
            onPressOut={() => onPressOut?.(star)}
            accessibilityRole="button"
            accessibilityLabel={DEFAULT_ACCESSIBILITY_LABEL(star)}
            accessibilityState={{ selected: star <= value }}
            className={starClassName}
          >
            <Feather
              name="star"
              size={size}
              color={star <= value ? activeColor : inactiveColor}
              fill={fillActive && star <= value ? activeColor : 'transparent'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

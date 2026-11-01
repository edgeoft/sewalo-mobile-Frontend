import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { THEME_COLORS } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type SpinnerSize = 'inline' | 'refresh' | 'blocking';

export interface SpinnerProps {
  /** Size preset: inline (20px), refresh (28px), or blocking (44px). Can also be a custom number. */
  size?: SpinnerSize | number;
  /** Custom stroke width in pixels. Defaults to calibrated spec for preset (2px, 3px, or 4px). */
  strokeWidth?: number;
  /** Primary arc color. Defaults to THEME_COLORS.primary. */
  color?: string;
  /** Background track color. Defaults to the primary color at 20% opacity. */
  trackColor?: string;
  /** Optional accessible label. Defaults to 'Loading'. */
  label?: string;
  /** Additional class names for the outer container. */
  className?: string;
  /** Custom styles for the outer container. */
  style?: ViewStyle;
}

const SIZE_MAP: Record<SpinnerSize, { size: number; stroke: number }> = {
  inline: { size: 20, stroke: 2 },
  refresh: { size: 28, stroke: 3 },
  blocking: { size: 44, stroke: 4 },
};

/**
 * Mobile Loader Kit Spinner
 * - 3 sizes: inline (20px), refresh (28px), blocking (44px)
 * - 1.4s rotation with arc growth/shrinkage on an ease-in-out loop
 * - Round ends with background track ring (18-30% opacity)
 * - Automatically respects system reduced motion preference
 */
export default function Spinner({
  size = 'inline',
  strokeWidth: customStrokeWidth,
  color = THEME_COLORS.primary,
  trackColor,
  label = 'Loading',
  className = '',
  style,
}: SpinnerProps) {
  const isReducedMotion = useReducedMotion();

  const resolved =
    typeof size === 'number' ? { size, stroke: customStrokeWidth ?? Math.max(2, size / 10) } : SIZE_MAP[size];

  const dimension = resolved.size;
  const stroke = customStrokeWidth ?? resolved.stroke;

  const center = dimension / 2;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animation values
  const rotation = useSharedValue(0);
  const arcProgress = useSharedValue(isReducedMotion ? 0.5 : 0.2);

  useEffect(() => {
    if (isReducedMotion) {
      // Reduced motion: Slow gentle continuous rotation with fixed half-arc
      rotation.value = 0;
      rotation.value = withRepeat(withTiming(360, { duration: 2800, easing: Easing.linear }), -1, false);
      arcProgress.value = 0.5;
    } else {
      // Standard spec: 1.4s rotation + ease-in-out arc expansion/contraction loop
      rotation.value = 0;
      rotation.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1, false);

      arcProgress.value = 0.2;
      arcProgress.value = withRepeat(
        withSequence(
          withTiming(0.72, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [isReducedMotion, rotation, arcProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const arcLength = circumference * arcProgress.value;
    return {
      strokeDasharray: [arcLength, circumference],
    };
  });

  const resolvedTrackColor = trackColor ?? color;

  return (
    <View
      pointerEvents="none"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[{ width: dimension, height: dimension }, style]}
      className={`items-center justify-center ${className}`}
    >
      <Animated.View style={[{ width: dimension, height: dimension }, animatedStyle]}>
        <Svg width={dimension} height={dimension}>
          {/* Background Track ring at 20% opacity */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={resolvedTrackColor}
            strokeWidth={stroke}
            opacity={0.22}
            fill="none"
          />
          {/* Active moving arc with round caps */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            animatedProps={animatedProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

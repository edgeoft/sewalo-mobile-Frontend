import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

interface SkeletonContextValue {
  progress: SharedValue<number>;
  fadeOpacity: SharedValue<number>;
  isReducedMotion: boolean;
}

const SkeletonContext = createContext<SkeletonContextValue | null>(null);

/**
 * Optional provider to synchronize all skeleton shimmer animations across a screen or list.
 * Loops every 1.4s with ease-in-out sweep (or 2.0s opacity pulse when reduced motion is enabled).
 */
export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  const isReducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const fadeOpacity = useSharedValue(1);

  useEffect(() => {
    if (isReducedMotion) {
      fadeOpacity.value = 1;
      fadeOpacity.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      progress.value = 0;
      progress.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false);
    }
  }, [isReducedMotion, progress, fadeOpacity]);

  return (
    <SkeletonContext.Provider value={{ progress, fadeOpacity, isReducedMotion }}>{children}</SkeletonContext.Provider>
  );
}

export interface SkeletonProps extends ViewProps {
  /** Optional class names for sizing, rounding, and margins (e.g. "w-full h-12 rounded-xl") */
  className?: string;
  /** Explicit style overrides */
  style?: StyleProp<ViewStyle>;
  /** Optional custom base color */
  baseColor?: string;
  /** Optional custom shimmer highlight color */
  highlightColor?: string;
}

/**
 * Mobile Loader Kit Shiny Skeleton
 * - Metallic shiny shimmer sweep over 1.4s ease-in-out loop
 * - Automatically falls back to gentle opacity fade (100% to 55% over 2s) if reduced motion is enabled
 * - Concealed from screen readers to prevent noisy placeholder announcements
 */
export default function Skeleton({
  className = 'w-full h-4 rounded-md',
  style,
  baseColor,
  highlightColor = 'rgba(255, 255, 255, 0.65)',
  ...props
}: SkeletonProps) {
  const context = useContext(SkeletonContext);
  const systemReducedMotion = useReducedMotion();
  const isReducedMotion = context ? context.isReducedMotion : systemReducedMotion;

  // Standalone animation fallback if no SkeletonProvider surrounds the element
  const localProgress = useSharedValue(0);
  const localFadeOpacity = useSharedValue(1);

  useEffect(() => {
    if (context) return;

    if (isReducedMotion) {
      localFadeOpacity.value = 1;
      localFadeOpacity.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      localProgress.value = 0;
      localProgress.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false);
    }
  }, [context, isReducedMotion, localProgress, localFadeOpacity]);

  const activeProgress = context ? context.progress : localProgress;
  const activeFadeOpacity = context ? context.fadeOpacity : localFadeOpacity;

  const [layoutWidth, setLayoutWidth] = useState(() => Dimensions.get('window').width);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== layoutWidth) {
      setLayoutWidth(width);
    }
    props.onLayout?.(e);
  };

  const sweepAnimatedStyle = useAnimatedStyle(() => {
    if (isReducedMotion) {
      return { opacity: 0 };
    }
    const translateX = interpolate(activeProgress.value, [0, 1], [-layoutWidth, layoutWidth * 1.5]);
    return {
      transform: [{ translateX }],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    if (!isReducedMotion) {
      return { opacity: 1 };
    }
    return {
      opacity: activeFadeOpacity.value,
    };
  });

  return (
    <Animated.View
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      aria-hidden={true}
      onLayout={handleLayout}
      style={[baseColor ? { backgroundColor: baseColor } : undefined, containerAnimatedStyle, style]}
      className={`overflow-hidden bg-slate-200 ${className}`}
      {...props}
    >
      {!isReducedMotion && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { width: layoutWidth * 0.8 }, sweepAnimatedStyle]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['transparent', highlightColor, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

/**
 * Text skeleton with multiple lines of varying widths (e.g. 70%, 45%, 30%).
 * Uses heights 12-16px with rounded pill corners according to the spec.
 */
function SkeletonText({
  lines = 3,
  className = 'gap-2',
  lineHeight = 14,
  lastLineWidth = '35%',
  style,
}: {
  lines?: number;
  className?: string;
  lineHeight?: number;
  lastLineWidth?: `${number}%`;
  style?: ViewStyle;
}) {
  const widths: `${number}%`[] = ['72%', '48%', lastLineWidth];

  return (
    <View
      style={style}
      className={className}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: lines }).map((_, index) => {
        const width = widths[index] || (index === lines - 1 ? lastLineWidth : '65%');
        const height = index === 0 ? Math.max(lineHeight, 16) : lineHeight;
        return <Skeleton key={index} style={{ width, height }} className="rounded-full" />;
      })}
    </View>
  );
}

/**
 * Circular avatar skeleton placeholder with 100% rounded corners.
 */
function SkeletonAvatar({
  size = 56,
  className = '',
  style,
}: {
  size?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Skeleton
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      className={`rounded-full shrink-0 ${className}`}
    />
  );
}

/**
 * Block skeleton for images, hero banners, or cards.
 */
function SkeletonBlock({
  width = '100%',
  height = 160,
  borderRadius = 12,
  className = '',
  style,
}: {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return <Skeleton style={[{ width, height, borderRadius }, style]} className={`shrink-0 ${className}`} />;
}

/**
 * Card container matching the design system cards.
 */
function SkeletonCard({
  children,
  className = '',
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={style}
      className={`rounded-2xl border border-border bg-background p-3.5 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </View>
  );
}

/**
 * Accessibility wrapper that announces a single "Loading" message for the whole area.
 */
function SkeletonGroup({
  children,
  label = 'Loading content',
  className = '',
  style,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      style={style}
      className={className}
    >
      <SkeletonProvider>{children}</SkeletonProvider>
    </View>
  );
}

// Compound component assignments
Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Block = SkeletonBlock;
Skeleton.Card = SkeletonCard;
Skeleton.Group = SkeletonGroup;
Skeleton.Provider = SkeletonProvider;

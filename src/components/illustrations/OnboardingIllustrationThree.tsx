import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G, Polygon, GProps } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  AnimatedProps,
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G) as unknown as React.ComponentType<
  AnimatedProps<GProps> & { style?: StyleProp<ViewStyle> }
>;

export default function OnboardingIllustrationThree({ isActive }: { isActive?: boolean }) {
  const handX = useSharedValue(60);
  const handY = useSharedValue(60);
  const starFillScale = useSharedValue(0);
  const lineDash = useSharedValue(0);
  const rippleScale = useSharedValue(0.2);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Hand cursor moving up to click the 5th star (plays once)
      handX.value = withSequence(
        withTiming(60, { duration: 0 }), // Start away
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }), // Move to 5th star
        withTiming(0, { duration: 1000 }), // Hold click
        withTiming(60, { duration: 1000, easing: Easing.inOut(Easing.quad) }), // Move away
      );

      handY.value = withSequence(
        withTiming(60, { duration: 0 }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000 }),
        withTiming(60, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      );

      // 5th star fills up when clicked
      starFillScale.value = withSequence(
        withTiming(0, { duration: 1000 }), // Wait for hand to arrive
        withTiming(1, { duration: 300, easing: Easing.out(Easing.back(2)) }), // Pop in
        withTiming(1, { duration: 1700 }), // Stay filled
      );

      // Confetti lines expanding out
      lineDash.value = withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(15, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(15, { duration: 1700 }),
      );

      // Ripple expanding ring animation synchronized with click
      rippleScale.value = withSequence(
        withTiming(0.2, { duration: 1000 }), // Wait
        withTiming(1.6, { duration: 600, easing: Easing.out(Easing.ease) }), // Expand
        withTiming(0.2, { duration: 0 }), // Reset
      );

      rippleOpacity.value = withSequence(
        withTiming(0, { duration: 1000 }), // Wait
        withTiming(0.8, { duration: 50 }), // Tap contact
        withTiming(0, { duration: 550, easing: Easing.out(Easing.ease) }), // Fade
      );
    } else {
      // Reset values when inactive
      handX.value = 60;
      handY.value = 60;
      starFillScale.value = 0;
      lineDash.value = 0;
      rippleScale.value = 0.2;
      rippleOpacity.value = 0;
    }
  }, [isActive, handX, handY, lineDash, rippleOpacity, rippleScale, starFillScale]);

  const handStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: handX.value }, { translateY: handY.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starFillScale.value }],
    opacity: starFillScale.value,
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: starFillScale.value > 0 ? 1 : 0,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const neutralFaceStyle = useAnimatedStyle(() => ({
    opacity: 1 - starFillScale.value,
  }));

  const happyFaceStyle = useAnimatedStyle(() => ({
    opacity: starFillScale.value,
  }));

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
        <Circle cx="120" cy="120" r="90" fill="#f8fafc" />

        {/* Provider Character peeking from behind rating card */}
        <G>
          {/* Shoulders */}
          <Path d="M 70 120 C 70 80 170 80 170 120 Z" fill="#485aff" />

          {/* Neck */}
          <Rect x="110" y="70" width="20" height="15" fill="#ffd8a8" />

          {/* Head */}
          <Circle cx="120" cy="50" r="28" fill="#ffd8a8" />

          {/* Hardhat */}
          <Path d="M96 45 C98 10 142 10 144 45 Z" fill="#fbbf24" />
          <Path d="M91 45 H149" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
          <Path d="M120 10 V45" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <Path d="M120 10 V45" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />

          {/* Animated Face Expressions */}
          {/* Neutral Face */}
          <AnimatedG style={neutralFaceStyle}>
            <Circle cx="110" cy="48" r="2.5" fill="#3730a3" />
            <Circle cx="130" cy="48" r="2.5" fill="#3730a3" />
            <Path
              d="M114 57 C114 62 126 62 126 57"
              stroke="#3730a3"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </AnimatedG>

          {/* Happy Face */}
          <AnimatedG style={happyFaceStyle}>
            <Path
              d="M106 50 C108 45 112 45 114 50"
              stroke="#3730a3"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M126 50 C128 45 132 45 134 50"
              stroke="#3730a3"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M114 56 C114 64 126 64 126 56 Z"
              fill="#ef4444"
              stroke="#3730a3"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <Circle cx="102" cy="54" r="3" fill="#f87171" opacity="0.5" />
            <Circle cx="138" cy="54" r="3" fill="#f87171" opacity="0.5" />
          </AnimatedG>
        </G>

        {/* Abstract App Layout Background */}
        <Rect x="40" y="80" width="160" height="100" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <Circle cx="70" cy="115" r="16" fill="#e0e7ff" />
        <Rect x="95" y="105" width="80" height="6" rx="3" fill="#cbd5e1" />
        <Rect x="95" y="120" width="50" height="6" rx="3" fill="#cbd5e1" />

        {/* Base 4 Stars (Always filled) */}
        <G y="145" x="65">
          <Polygon points="10,0 13,10 23,10 15,16 18,26 10,20 2,26 5,16 -3,10 7,10" fill="#fbbf24" />
          <Polygon points="35,0 38,10 48,10 40,16 43,26 35,20 27,26 30,16 22,10 32,10" fill="#fbbf24" />
          <Polygon points="60,0 63,10 73,10 65,16 68,26 60,20 52,26 55,16 47,10 57,10" fill="#fbbf24" />
          <Polygon points="85,0 88,10 98,10 90,16 93,26 85,20 77,26 80,16 72,10 82,10" fill="#fbbf24" />

          {/* 5th Star (Empty outline) */}
          <Polygon
            points="110,0 113,10 123,10 115,16 118,26 110,20 102,26 105,16 97,10 107,10"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </G>
      </Svg>

      {/* Animated 5th Star Fill */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          <AnimatedG style={starStyle} origin="175, 155">
            <Polygon
              points="175,145 178,155 188,155 180,161 183,171 175,165 167,171 170,161 162,155 172,155"
              fill="#fbbf24"
            />
          </AnimatedG>
        </Svg>
      </View>

      {/* Confetti bursting from 5th star */}
      <Animated.View style={[StyleSheet.absoluteFill, confettiStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          <G x="175" y="155">
            <Circle cx="0" cy="-25" r="3" fill="#10b981" />
            <Circle cx="20" cy="-15" r="2" fill="#485aff" />
            <Circle cx="-20" cy="-15" r="2.5" fill="#fbbf24" />
          </G>
        </Svg>
      </Animated.View>

      {/* Dual-ring Touch Ripple Animation */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          <AnimatedG style={rippleStyle} origin="175, 155">
            <Circle cx="175" cy="155" r="15" fill="none" stroke="#485aff" strokeWidth="3" opacity="0.6" />
            <Circle cx="175" cy="155" r="8" fill="none" stroke="#485aff" strokeWidth="2" opacity="0.4" />
          </AnimatedG>
        </Svg>
      </View>

      {/* Animated Simple Touch Cursor Pointer */}
      <Animated.View style={[StyleSheet.absoluteFill, handStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          {/* Angled group around the touch tip at (0, 0) in local space */}
          <G x="175" y="155" transform="rotate(-15 0 0)">
            <Path
              d="M 0 0 L 12 12 L 5.5 12 L 9.5 20 L 6.5 21 L 2.5 13 L -2.5 15.5 Z"
              fill="#485aff"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 240,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
});

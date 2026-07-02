import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function OnboardingIllustrationOne() {
  const armRotation = useSharedValue(0);
  const sparkleY = useSharedValue(0);

  useEffect(() => {
    // Waving arm animation
    armRotation.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500 }), // pause
      ),
      -1,
      true,
    );

    // Sparkle floating
    sparkleY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [armRotation, sparkleY]);

  const armStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${armRotation.value}deg` }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sparkleY.value }],
  }));

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
        {/* Background blobs matching app colors */}
        <Circle cx="120" cy="120" r="90" fill="#e0e7ff" opacity="0.6" />
        <Circle cx="120" cy="120" r="60" fill="#cbd5e1" opacity="0.2" />

        {/* Service Provider Character */}
        <G>
          {/* Left Arm (Static) */}
          <Path
            d="M 76 135 C 65 142 60 152 58 162"
            fill="none"
            stroke="#485aff"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <Path d="M 58 162 L 56 166" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
          <Path
            d="M 56 166 C 53 175 51 185 53 195"
            fill="none"
            stroke="#ffd8a8"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Body / Shirt */}
          <Path d="M70 200 C70 140 170 140 170 200 Z" fill="#485aff" />

          {/* Safety Vest */}
          <Path d="M 90 138 L 120 160 L 150 138 L 165 200 H 75 Z" fill="#f97316" />
          {/* Reflective Silver Stripes */}
          <Path d="M 102 147 V 200" stroke="#f1f5f9" strokeWidth="6" />
          <Path d="M 138 147 V 200" stroke="#f1f5f9" strokeWidth="6" />
          <Path d="M 87 175 H 153" stroke="#f1f5f9" strokeWidth="6" />

          {/* Neck */}
          <Path d="M 112 120 V 132 C 112 138 128 138 128 132 V 120 Z" fill="#ffd8a8" />
          {/* Collar Flaps */}
          <Path d="M 100 125 L 120 142 L 120 125 Z" fill="#3b82f6" />
          <Path d="M 140 125 L 120 142 L 120 125 Z" fill="#1d4ed8" />

          {/* Head & Skin */}
          <Circle cx="120" cy="95" r="28" fill="#ffd8a8" />

          {/* Friendly Face */}
          <Circle cx="110" cy="93" r="2.5" fill="#3730a3" />
          <Circle cx="130" cy="93" r="2.5" fill="#3730a3" />
          <Path
            d="M114 102 C114 108 126 108 126 102"
            stroke="#3730a3"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="104" cy="98" r="3" fill="#f87171" opacity="0.4" />
          <Circle cx="136" cy="98" r="3" fill="#f87171" opacity="0.4" />

          {/* Hardhat */}
          <Path d="M88 90 C90 55 150 55 152 90 Z" fill="#fbbf24" />
          <Path d="M82 90 H158" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
          <Path d="M86 93 H154" stroke="#d97706" strokeWidth="2" opacity="0.5" />
          {/* Crest */}
          <Path d="M 120 54 V 90" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <Path d="M 120 54 V 90" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          {/* Highlight */}
          <Path
            d="M96 82 C98 62 142 62 144 82"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.6"
            fill="none"
          />
        </G>
      </Svg>

      {/* Right Waving Arm */}
      <Animated.View style={[StyleSheet.absoluteFill, armStyle, { transformOrigin: '165px 145px' }]}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          {/* Arm Sleeve */}
          <Path
            d="M 165 145 C 175 135 185 125 180 110"
            stroke="#485aff"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
          {/* Sleeve Cuff */}
          <Path d="M 180 110 L 183 105" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
          {/* Forearm */}
          <Path
            d="M 183 105 C 187 96 191 86 189 78"
            stroke="#ffd8a8"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Palm */}
          <Circle cx="189" cy="76" r="7" fill="#ffd8a8" />
          {/* Fingers */}
          <Path d="M 184 73 Q 178 72 179 67" stroke="#ffd8a8" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 187 70 V 59" stroke="#ffd8a8" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 191 69 V 57" stroke="#ffd8a8" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 195 70 V 59" stroke="#ffd8a8" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 199 72 V 63" stroke="#ffd8a8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>

      {/* Trusted / Verified Badge floating on the left */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          {/* Badge Background Glow */}
          <Circle cx="52" cy="120" r="26" fill="#ffffff" />
          <Circle cx="52" cy="120" r="26" fill="none" stroke="#e0e7ff" strokeWidth="2.5" />

          {/* Shield */}
          <Path
            d="M 37 110 L 52 101 L 67 110 V 124 C 67 132 59 139 52 142 C 45 139 37 132 37 124 Z"
            fill="none"
            stroke="#485aff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Checkmark */}
          <Path
            d="M 45 120 L 50 126 L 59 113"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Floating Sparkles */}
      <Animated.View style={[StyleSheet.absoluteFill, sparkleStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
          <Path d="M30 60 L35 70 L45 75 L35 80 L30 90 L25 80 L15 75 L25 70 Z" fill="#fbbf24" />
          <Path d="M200 130 L203 136 L209 139 L203 142 L200 148 L197 142 L191 139 L197 136 Z" fill="#fbbf24" />
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

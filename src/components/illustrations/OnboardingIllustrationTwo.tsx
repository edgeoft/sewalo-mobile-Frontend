import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';
const AnimatedG = Animated.createAnimatedComponent(G) as any;

export default function OnboardingIllustrationTwo({ isActive }: { isActive?: boolean }) {
  const progress = useSharedValue(0);
  const planeOpacity = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Play once! Total duration 3000ms
      progress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500 }), // hold at 1
      );

      planeOpacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 150 }), // fade in
        withTiming(1, { duration: 1200 }), // hold
        withTiming(0, { duration: 150 }), // fade out
        withTiming(0, { duration: 1500 }), // hide during success display
      );

      successOpacity.value = withSequence(
        withTiming(0, { duration: 1400 }), // Wait for flight
        withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) }), // Pop in
        withTiming(1, { duration: 1300 }), // hold success visible
      );
    } else {
      // Reset values when inactive
      progress.value = 0;
      planeOpacity.value = 0;
      successOpacity.value = 0;
    }
  }, [isActive, planeOpacity, progress, successOpacity]);

  const planeStyle = useAnimatedStyle(() => {
    const t = progress.value;
    // Bezier control points: P0 = (65, 170), P1 = (120, 20), P2 = (175, 115)
    const x0 = 65,
      y0 = 170;
    const x1 = 120,
      y1 = 20;
    const x2 = 175,
      y2 = 115;

    const mt = 1 - t;
    const x = mt * mt * x0 + 2 * mt * t * x1 + t * t * x2;
    const y = mt * mt * y0 + 2 * mt * t * y1 + t * t * y2;

    const dx = 2 * mt * (x1 - x0) + 2 * t * (x2 - x1);
    const dy = 2 * mt * (y1 - y0) + 2 * t * (y2 - y1);

    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    return {
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${angleDeg}deg` }],
      opacity: planeOpacity.value,
    };
  });

  const successStyle = useAnimatedStyle(() => {
    const yOffset = (1 - successOpacity.value) * 8;
    return {
      transform: [{ translateY: yOffset }],
      opacity: successOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 240 240" fill="none">
        <Circle cx="120" cy="120" r="90" fill="#f8fafc" />
        <Circle cx="120" cy="120" r="60" fill="#e0e7ff" opacity="0.6" />

        {/* Curved dotted flight path from Customer to Provider */}
        <Path
          d="M 65 170 Q 120 20 175 115"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeDasharray="4,4"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Device 1 (Left - Customer Booking Request Screen) */}
        <G>
          {/* Phone Shell */}
          <Rect x="30" y="60" width="70" height="130" rx="10" fill="#ffffff" stroke="#485aff" strokeWidth="3" />
          <Rect x="45" y="65" width="40" height="4" rx="2" fill="#cbd5e1" />
          {/* Status bar items */}
          <Circle cx="39" cy="67" r="1.5" fill="#cbd5e1" />
          <Rect x="87" y="66" width="5" height="2.5" fill="#cbd5e1" />

          {/* Booking Card Form */}
          <Rect x="38" y="78" width="54" height="26" rx="4" fill="#e0e7ff" />
          {/* Map line inside card */}
          <Path d="M 44 91 C 52 86 58 96 70 88" stroke="#485aff" strokeWidth="1.5" fill="none" />
          <Circle cx="70" cy="88" r="2" fill="#ef4444" />

          {/* Details */}
          <Rect x="38" y="112" width="44" height="5" rx="1.5" fill="#3730a3" />
          <Rect x="38" y="122" width="54" height="3" rx="1" fill="#94a3b8" />
          <Rect x="38" y="128" width="36" height="3" rx="1" fill="#94a3b8" />

          {/* Price badge */}
          <Rect x="38" y="137" width="22" height="7" rx="2.5" fill="#10b981" />

          {/* Send Booking Request Button */}
          <Rect x="38" y="154" width="54" height="18" rx="9" fill="#485aff" />
          {/* Tiny paper plane logo in button */}
          <Path d="M 61 160 L 69 163 L 61 166 L 63 163 Z" fill="#ffffff" />
        </G>

        {/* Device 2 (Right - Provider Offers Dashboard) */}
        <G>
          {/* Phone Shell */}
          <Rect x="140" y="60" width="70" height="130" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          <Rect x="155" y="65" width="40" height="4" rx="2" fill="#cbd5e1" />
          <Circle cx="149" cy="67" r="1.5" fill="#cbd5e1" />
          <Rect x="197" y="66" width="5" height="2.5" fill="#cbd5e1" />

          {/* Incoming Job offer Card */}
          <Rect x="148" y="78" width="54" height="46" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          {/* Customer Avatar & Name lines */}
          <Circle cx="160" cy="91" r="6" fill="#e0e7ff" />
          <Rect x="170" y="89" width="24" height="4" rx="1.5" fill="#3730a3" />
          <Rect x="154" y="103" width="42" height="3" rx="1" fill="#94a3b8" />
          <Rect x="154" y="109" width="30" height="3" rx="1" fill="#94a3b8" />

          {/* Accept / Decline Action buttons */}
          <Rect x="148" y="132" width="24" height="11" rx="3.5" fill="#ef4444" opacity="0.8" />
          <Rect x="178" y="132" width="24" height="11" rx="3.5" fill="#10b981" />
        </G>
        {/* Symmetric Flying Paper Airplane centered at (0, 0) */}
        <AnimatedG style={planeStyle}>
          {/* Centered paper plane at (0, 0) */}
          <Path d="M -16 -8 L 16 0 L -16 8 L -8 0 Z" fill="#485aff" />
          <Path d="M -8 0 L 0 3 L -8 6 Z" fill="#e0e7ff" stroke="#485aff" strokeWidth="0.5" />
        </AnimatedG>

        {/* Success Popup Confirmation on Device 2 */}
        <AnimatedG style={successStyle}>
          <G x="145" y="85">
            <Rect x="0" y="0" width="60" height="45" rx="6" fill="#10b981" />
            {/* White check circle */}
            <Circle cx="30" cy="18" r="9" fill="#ffffff" />
            <Path
              d="M 26 18 L 29 21 L 34 15"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Confirmed text bar */}
            <Rect x="15" y="32" width="30" height="3" rx="1.5" fill="#ffffff" />
          </G>
        </AnimatedG>
      </Svg>
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

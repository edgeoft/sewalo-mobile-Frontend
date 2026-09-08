import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { THEME_COLORS } from '@/constants/colors';

export default function ReferralVerificationIllustration() {
  return (
    <View style={styles.container}>
      <Svg width="140" height="110" viewBox="0 0 140 110" fill="none">
        {/* Soft Background Circles */}
        <Circle cx="70" cy="55" r="48" fill={THEME_COLORS.surfaceIndigoSubtle} />
        <Circle cx="70" cy="55" r="38" fill={THEME_COLORS.surfaceBrandSubtle} />
        <Circle cx="70" cy="55" r="46" stroke={THEME_COLORS.slate200} strokeWidth="1" strokeDasharray="3 3" />

        {/* Primary Security Shield */}
        <G>
          {/* Main Shield */}
          <Path
            d="M 70 20 C 88 20 102 25 102 25 C 102 60 85 82 70 93 C 55 82 38 60 38 25 C 38 25 52 20 70 20 Z"
            fill={THEME_COLORS.primary}
          />
          {/* Subtle Inner Glow */}
          <Path
            d="M 70 24 C 84 24 96 28 96 28 C 96 57 82 76 70 86 C 58 76 44 57 44 28 C 44 28 56 24 70 24 Z"
            fill={THEME_COLORS.primaryForeground}
            opacity={0.15}
          />

          {/* User Silhouette on Shield */}
          <Circle cx="70" cy="42" r="8" fill={THEME_COLORS.primaryForeground} />
          <Path d="M 56 66 C 56 57 62 53 70 53 C 78 53 84 57 84 66 Z" fill={THEME_COLORS.primaryForeground} />
        </G>

        {/* Verified Badge with Checkmark */}
        <G>
          <Circle
            cx="92"
            cy="74"
            r="11"
            fill={THEME_COLORS.amberStar}
            stroke={THEME_COLORS.primaryForeground}
            strokeWidth="2"
          />
          <Path
            d="M 88 74 L 91 77 L 96 72"
            stroke={THEME_COLORS.primaryForeground}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>

        {/* Small Decorative Sparkle */}
        <Path
          d="M 36 38 L 37.5 42 L 41.5 43.5 L 37.5 45 L 36 49 L 34.5 45 L 30.5 43.5 L 34.5 42 Z"
          fill={THEME_COLORS.primary}
          opacity={0.6}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
});

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  withSequence,
  useAnimatedStyle,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function BookingAnimatedCheckmark() {
  const checkProgress = useSharedValue(1);
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    checkProgress.value = withDelay(600, withTiming(0, { duration: 450 }));

    scale.value = withSequence(
      withTiming(1, { duration: 0 }),
      withDelay(1050, withTiming(1.22, { duration: 200 })),
      withTiming(1.0, { duration: 150 }),
    );

    ringScale.value = withDelay(1050, withTiming(1.3, { duration: 550 }));
    ringOpacity.value = withSequence(
      withTiming(0, { duration: 1050 }),
      withTiming(0.5, { duration: 150 }),
      withTiming(0, { duration: 400 }),
    );
  }, [checkProgress, scale, ringOpacity, ringScale]);

  const checkAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: checkProgress.value * 40,
    opacity: 1 - checkProgress.value,
  }));

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View className="items-center justify-center h-28 w-28 relative">
      <AnimatedView style={ringAnimatedStyle} className="absolute h-20 w-20 rounded-full bg-primary/20" />
      <AnimatedView style={scaleAnimatedStyle}>
        <Svg width={80} height={80} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="44" fill="#eff2fe" />
          <Circle cx="50" cy="50" r="36" fill="#e0e7ff" />
          <Circle cx="50" cy="50" r="30" fill="#485aff" />
          <AnimatedPath
            d="M38 50 L46 58 L62 42"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={40}
            animatedProps={checkAnimatedProps}
          />
        </Svg>
      </AnimatedView>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { THEME_COLORS } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProfileCompletionCardProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  hideChecklist?: boolean;
}

export default function ProfileCompletionCard({
  size = 46,
  strokeWidth = 4,
  className = '',
  hideChecklist = false,
}: ProfileCompletionCardProps) {
  const router = useRouter();
  const { percentage, completedCount, totalCount, items, topPrompt, isFullyComplete } = useProfileCompletion();
  const [expanded, setExpanded] = useState(false);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const fillPercentage = percentage / 100;
  const targetOffset = circumference - fillPercentage * circumference;
  const strokeDashoffset = useSharedValue(circumference);

  useEffect(() => {
    strokeDashoffset.value = withTiming(targetOffset, {
      duration: 700,
      easing: Easing.out(Easing.quad),
    });
  }, [targetOffset, strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const progressColor = isFullyComplete ? THEME_COLORS.emeraldSuccess : THEME_COLORS.primary;

  return (
    <View className={`rounded-xl border border-gray-200 bg-white p-4 mb-5 ${className}`}>
      {/* Top Header Row (Pressable to toggle checklist) */}
      <Pressable
        onPress={hideChecklist ? undefined : () => setExpanded((prev) => !prev)}
        disabled={hideChecklist}
        accessibilityRole={hideChecklist ? undefined : 'button'}
        accessibilityLabel={expanded ? 'Collapse profile checklist' : 'Expand profile checklist'}
        accessibilityState={{ expanded }}
        className="flex-row items-center justify-between gap-x-3.5"
      >
        {/* Left: Radial Progress Ring */}
        <View style={{ width: size, height: size }} className="items-center justify-center relative flex-shrink-0">
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {/* Background Track Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={isFullyComplete ? '#d1fae5' : THEME_COLORS.slate100}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Active Radial Progress Circle */}
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeDasharray={[circumference, circumference]}
              animatedProps={animatedProps}
              strokeDashoffset={targetOffset}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          {/* Percentage Text in Center */}
          <View className="absolute items-center justify-center">
            <Text
              className={`text-[11px] font-sans-extrabold ${isFullyComplete ? 'text-emerald-700' : 'text-gray-900'}`}
            >
              {percentage}%
            </Text>
          </View>
        </View>

        {/* Center Info: Title on top, status badge + count on bottom */}
        <View className="flex-1 min-w-0 justify-center">
          <Text className="text-sm font-sans-bold text-gray-900" numberOfLines={1}>
            Profile Completion
          </Text>

          <View className="flex-row items-center gap-x-2 mt-0.5 flex-wrap">
            {isFullyComplete ? (
              <View className="bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md flex-row items-center">
                <Feather name="check-circle" size={9} color={THEME_COLORS.emeraldSuccess} />
                <Text className="text-[10px] font-sans-bold text-emerald-700 ml-1">Complete</Text>
              </View>
            ) : (
              <View className="bg-surface-indigo-subtle border border-indigo-100/80 px-1.5 py-0.5 rounded-md flex-row items-center">
                <Text className="text-[10px] font-sans-bold text-primary">{totalCount - completedCount} left</Text>
              </View>
            )}
            <Text className="text-[11px] font-sans-medium text-gray-400">
              {completedCount} of {totalCount} sections
            </Text>
          </View>
        </View>

        {/* Right Action / Expand Toggle Chevron */}
        {!hideChecklist && (
          <View className="h-8 w-8 rounded-full bg-slate-50 items-center justify-center border border-slate-200/70 flex-shrink-0">
            <Feather
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={THEME_COLORS.slate500}
              accessible={false}
            />
          </View>
        )}
      </Pressable>

      {/* Contextual Recommendation Banner */}
      <View
        className={`mt-3 rounded-lg p-2.5 flex-row items-center gap-x-2.5 ${
          isFullyComplete
            ? 'bg-emerald-50/80 border border-emerald-200/70'
            : 'bg-surface-indigo-subtle border border-indigo-100/70'
        }`}
      >
        <View
          className={`h-6 w-6 rounded-full items-center justify-center flex-shrink-0 ${
            isFullyComplete ? 'bg-emerald-100' : 'bg-primary/10'
          }`}
        >
          <Feather
            name={isFullyComplete ? 'award' : 'info'}
            size={13}
            color={isFullyComplete ? THEME_COLORS.emeraldSuccess : THEME_COLORS.primary}
          />
        </View>
        <Text
          className={`text-[11px] font-sans-medium flex-1 leading-snug ${
            isFullyComplete ? 'text-emerald-950' : 'text-gray-600'
          }`}
        >
          {topPrompt}
        </Text>
      </View>

      {/* Expandable Section Checklist */}
      {!hideChecklist && expanded && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center justify-between mb-2 px-1">
            <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider">Profile Sections</Text>
            <Text className="text-[10px] font-sans-semibold text-gray-400">
              {completedCount}/{totalCount} Completed
            </Text>
          </View>

          <View className="gap-y-2">
            {items.map((item) => (
              <View
                key={item.key}
                className="flex-row items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50/60 border border-gray-100/80"
              >
                <View className="flex-row items-center gap-x-2.5 flex-1 mr-2">
                  <View
                    className={`h-5 w-5 rounded-full items-center justify-center ${
                      item.isComplete ? 'bg-emerald-100 border border-emerald-200' : 'bg-white border border-gray-300'
                    }`}
                  >
                    {item.isComplete ? (
                      <Feather name="check" size={11} color={THEME_COLORS.emeraldSuccess} />
                    ) : (
                      <View className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    )}
                  </View>
                  <Text className={`text-xs font-sans-semibold ${item.isComplete ? 'text-gray-700' : 'text-gray-900'}`}>
                    {item.label}
                  </Text>
                </View>

                {item.isComplete ? (
                  <View className="px-2 py-0.5">
                    <Text className="text-[11px] font-sans-semibold text-emerald-600">Done</Text>
                  </View>
                ) : item.actionRoute ? (
                  <Pressable
                    onPress={() => router.push(item.actionRoute!)}
                    accessibilityRole="button"
                    accessibilityLabel={`Complete ${item.label}`}
                    className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md active:bg-primary/20 flex-row items-center gap-x-1"
                  >
                    <Text className="text-[11px] font-sans-bold text-primary">Complete</Text>
                    <Feather name="chevron-right" size={10} color={THEME_COLORS.primary} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProfileCompletionCardProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  hideChecklist?: boolean;
}

export default function ProfileCompletionCard({
  size = 68,
  strokeWidth = 5,
  className = '',
  hideChecklist = false,
}: ProfileCompletionCardProps) {
  const router = useRouter();
  const { percentage, completedCount, totalCount, items, topPrompt, isFullyComplete } = useProfileCompletion();
  const [expanded, setExpanded] = useState(false);

  // SVG calculations for radial progress ring
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

  const progressColor = isFullyComplete ? '#10b981' : '#485aff';
  const incompleteItems = items.filter((item) => !item.isComplete);

  return (
    <View
      className={`rounded-xl border border-gray-200 bg-white p-4 mb-5 ${className}`}
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 0,
      }}
    >
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between gap-x-4">
        {/* Left: Radial Progress Ring */}
        <View style={{ width: size, height: size }} className="items-center justify-center relative">
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {/* Background Track Circle */}
            <Circle cx={center} cy={center} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
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
            <Text className="text-sm font-sans-extrabold text-gray-900">{percentage}%</Text>
          </View>
        </View>

        {/* Center Info */}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-sans-bold text-gray-950">Profile Completion</Text>
            {isFullyComplete && (
              <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center">
                <Feather name="check-circle" size={10} color="#10b981" />
                <Text className="text-[10px] font-sans-bold text-emerald-700 ml-1">Complete</Text>
              </View>
            )}
          </View>
          <Text className="text-xs font-sans-semibold text-gray-500 mt-0.5">
            {completedCount} of {totalCount} sections completed
          </Text>
        </View>

        {/* Right Action / Expand Toggle */}
        {!hideChecklist && (
          <Pressable
            onPress={() => setExpanded(!expanded)}
            accessibilityRole="button"
            accessibilityLabel="Toggle profile checklist"
            accessibilityState={{ expanded }}
            hitSlop={8}
            className="p-2 rounded-full bg-gray-50 active:bg-gray-100 border border-gray-100"
          >
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#64748b" accessible={false} />
          </Pressable>
        )}
      </View>

      {/* Contextual Recommendation Banner */}
      <View className="mt-3 bg-primary/5 border border-primary/10 rounded-lg p-2.5 flex-row items-center gap-x-2.5">
        <View className="h-6 w-6 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
          <Feather name={isFullyComplete ? 'award' : 'info'} size={13} color="#485aff" />
        </View>
        <Text className="text-xs font-sans-medium text-gray-700 flex-1 leading-snug">{topPrompt}</Text>
      </View>

      {/* Expandable Section Checklist - ONLY Incomplete Items */}
      {!hideChecklist && expanded && (
        <View className="mt-3.5 pt-3 border-t border-gray-100 gap-y-2">
          {incompleteItems.length > 0 ? (
            incompleteItems.map((item) => (
              <View key={item.key} className="flex-row items-center justify-between py-1 px-1">
                <View className="flex-row items-center gap-x-2.5 flex-1 mr-2">
                  <View className="h-5 w-5 rounded-full items-center justify-center bg-gray-100 border border-gray-200">
                    <Feather name="circle" size={12} color="#94a3b8" />
                  </View>
                  <Text className="text-xs font-sans-semibold text-gray-900">{item.label}</Text>
                </View>

                {item.actionRoute && (
                  <Pressable
                    onPress={() => router.push(item.actionRoute as any)}
                    accessibilityRole="button"
                    className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md active:bg-primary/20"
                  >
                    <Text className="text-[11px] font-sans-bold text-primary">Complete</Text>
                  </Pressable>
                )}
              </View>
            ))
          ) : (
            <View className="flex-row items-center justify-center py-2 bg-emerald-50/50 rounded-lg">
              <Feather name="check-circle" size={14} color="#10b981" />
              <Text className="text-xs font-sans-semibold text-emerald-700 ml-1.5">
                All profile sections completed!
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

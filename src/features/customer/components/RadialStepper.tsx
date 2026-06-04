import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialStepperProps {
  status: BookingStatus;
  size?: number;
  strokeWidth?: number;
}

interface StepConfig {
  stepNumber: number;
  label: string;
  nextLabel: string;
  iconName: keyof typeof Feather.glyphMap;
  iconColor: string;
  progressColor: string;
  bgColor: string;
}

const STEP_CONFIGS: Record<string, StepConfig> = {
  [BOOKING_STATUSES.Pending]: {
    stepNumber: 1,
    label: 'Request Sent',
    nextLabel: 'Accept',
    iconName: 'send',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Confirmed]: {
    stepNumber: 2,
    label: 'Booking Confirmed',
    nextLabel: 'Job Started',
    iconName: 'calendar',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.InProgress]: {
    stepNumber: 3,
    label: 'Job Started',
    nextLabel: 'Completed',
    iconName: 'tool',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Completed]: {
    stepNumber: 4,
    label: 'Job Completed',
    nextLabel: 'Ready to Pay',
    iconName: 'award',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.ReadyToPay]: {
    stepNumber: 5,
    label: 'Ready to Pay',
    nextLabel: 'Payment Initiated',
    iconName: 'file-text',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.PaymentInitiated]: {
    stepNumber: 6,
    label: 'Payment Initiated',
    nextLabel: 'Jobs Completed',
    iconName: 'refresh-cw',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Paid]: {
    stepNumber: 7,
    label: 'Jobs Completed',
    nextLabel: 'Enjoy your service!',
    iconName: 'check',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  // Fallbacks for non-linear states
  [BOOKING_STATUSES.Cancelled]: {
    stepNumber: 0,
    label: 'Cancelled',
    nextLabel: 'Booking has been cancelled',
    iconName: 'x-circle',
    iconColor: '#ef4444',
    progressColor: '#ef4444',
    bgColor: '#fef2f2',
  },
  [BOOKING_STATUSES.Rejected]: {
    stepNumber: 0,
    label: 'Rejected',
    nextLabel: 'Booking has been rejected',
    iconName: 'alert-triangle',
    iconColor: '#f97316',
    progressColor: '#f97316',
    bgColor: '#fff7ed',
  },
};

export default function RadialStepper({ status, size = 64, strokeWidth = 4 }: RadialStepperProps) {
  const config = STEP_CONFIGS[status] || STEP_CONFIGS[BOOKING_STATUSES.Pending];
  const isCancelledOrRejected = status === BOOKING_STATUSES.Cancelled || status === BOOKING_STATUSES.Rejected;

  const totalSteps = 7;
  const currentStep = config.stepNumber;

  // SVG calculations
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // For cancelled/rejected, we show full circle colored red/orange or just no progress
  const fillPercentage = isCancelledOrRejected ? 100 : currentStep / totalSteps;
  const targetOffset = circumference - fillPercentage * circumference;

  const strokeDashoffset = useSharedValue(circumference); // Start empty

  useEffect(() => {
    strokeDashoffset.value = withSpring(targetOffset, {
      damping: 15,
      stiffness: 90,
    });
  }, [targetOffset, strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  });

  return (
    <View
      className="flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 mb-6"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Circle Container */}
      <View style={{ width: size, height: size }} className="items-center justify-center relative">
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background Circle */}
          <Circle cx={center} cy={center} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none" />
          {/* Active Arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={config.progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        {/* Central Icon */}
        <View
          className="absolute items-center justify-center"
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
          }}
        >
          <Feather name={config.iconName} size={22} color={config.iconColor} />
        </View>
      </View>

      {/* Steps Metadata */}
      <View className="flex-1 justify-center">
        <Text className="text-xs font-sans-bold uppercase tracking-wider text-gray-400">
          {isCancelledOrRejected ? 'Status' : `Step ${currentStep} of ${totalSteps}`}
        </Text>
        <Text className="text-lg font-sans-bold text-gray-950 leading-tight py-0.5">{config.label}</Text>
      </View>
    </View>
  );
}

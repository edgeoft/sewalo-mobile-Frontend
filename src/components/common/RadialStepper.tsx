import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialStepperProps {
  status?: BookingStatus;
  role?: 'customer' | 'provider';
  size?: number;
  strokeWidth?: number;
  currentStep?: number;
  totalSteps?: number;
  label?: string;
  subtitle?: string;
  iconName?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  progressColor?: string;
  bgColor?: string;
}

interface StepConfig {
  stepNumber: number;
  label: string;
  subtitles: {
    customer: string;
    provider: string;
  };
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
    subtitles: {
      customer: 'Sending request to provider!\nHang tight for confirmation.',
      provider: 'New booking request received!\nReview and accept it now.',
    },
    nextLabel: 'Accept',
    iconName: 'send',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Confirmed]: {
    stepNumber: 2,
    label: 'Booking Confirmed',
    subtitles: {
      customer: 'Yay! Provider accepted the booking.\nThey will start work soon.',
      provider: 'Nice job! You confirmed the booking.\nGet ready to start work.',
    },
    nextLabel: 'Job Started',
    iconName: 'calendar',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.InProgress]: {
    stepNumber: 3,
    label: 'Job Started',
    subtitles: {
      customer: 'Awesome, service is starting!\nProvider is performing the job.',
      provider: "Let's do this! Work is in progress.\nPerform the service.",
    },
    nextLabel: 'Completed',
    iconName: 'tool',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Completed]: {
    stepNumber: 4,
    label: 'Job Completed',
    subtitles: {
      customer: 'Job completed successfully!\nWaiting for provider to send invoice.',
      provider: 'Great work! Job is completed.\nCreate and send the final invoice.',
    },
    nextLabel: 'Ready to Pay',
    iconName: 'award',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.ReadyToPay]: {
    stepNumber: 5,
    label: 'Ready to Pay',
    subtitles: {
      customer: 'Your invoice is ready for review!\nCheckout now to complete booking.',
      provider: 'Invoice sent to customer!\nAwaiting customer payment.',
    },
    nextLabel: 'Payment Initiated',
    iconName: 'file-text',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.PaymentInitiated]: {
    stepNumber: 6,
    label: 'Payment Initiated',
    subtitles: {
      customer: 'Processing your payment...\nWe are finalizing the booking.',
      provider: 'Payment has been initiated!\nPlease confirm receipt.',
    },
    nextLabel: 'Jobs Completed',
    iconName: 'refresh-cw',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Paid]: {
    stepNumber: 7,
    label: 'Jobs Completed',
    subtitles: {
      customer: 'All paid! Thanks for choosing us.\nEnjoy your completed service!',
      provider: 'Sweet! Payment confirmed.\nThis booking is fully completed!',
    },
    nextLabel: 'Enjoy your service!',
    iconName: 'check',
    iconColor: '#485aff',
    progressColor: '#485aff',
    bgColor: '#f4f6ff',
  },
  [BOOKING_STATUSES.Cancelled]: {
    stepNumber: 0,
    label: 'Cancelled',
    subtitles: {
      customer: 'This booking has been cancelled.\nContact support for help.',
      provider: 'This booking has been cancelled.\nNo further action is needed.',
    },
    nextLabel: 'Booking has been cancelled',
    iconName: 'x-circle',
    iconColor: '#ef4444',
    progressColor: '#ef4444',
    bgColor: '#fef2f2',
  },
  [BOOKING_STATUSES.Rejected]: {
    stepNumber: 0,
    label: 'Rejected',
    subtitles: {
      customer: 'This booking request was rejected.\nTry booking another provider.',
      provider: 'You rejected this request.\nThis booking is closed.',
    },
    nextLabel: 'Booking has been rejected',
    iconName: 'alert-triangle',
    iconColor: '#f97316',
    progressColor: '#f97316',
    bgColor: '#fff7ed',
  },
};

export default function RadialStepper({
  status,
  role = 'customer',
  size = 64,
  strokeWidth = 4,
  currentStep,
  totalSteps,
  label,
  subtitle,
  iconName,
  iconColor,
  progressColor,
  bgColor,
}: RadialStepperProps) {
  const isCustom = !status;

  const resolvedConfig = isCustom
    ? {
        stepNumber: currentStep || 1,
        label: label || '',
        subtitle: subtitle || '',
        iconName: iconName || 'help-circle',
        iconColor: iconColor || '#485aff',
        progressColor: progressColor || '#485aff',
        bgColor: bgColor || '#f4f6ff',
      }
    : (() => {
        const config = STEP_CONFIGS[status] || STEP_CONFIGS[BOOKING_STATUSES.Pending];
        return {
          stepNumber: config.stepNumber,
          label: config.label,
          subtitle: config.subtitles[role],
          iconName: config.iconName,
          iconColor: config.iconColor,
          progressColor: config.progressColor,
          bgColor: config.bgColor,
        };
      })();

  const isCancelledOrRejected =
    !isCustom && (status === BOOKING_STATUSES.Cancelled || status === BOOKING_STATUSES.Rejected);

  const total = isCustom ? totalSteps || 1 : 7;
  const current = resolvedConfig.stepNumber;

  // SVG calculations
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // For cancelled/rejected, we show full circle colored red/orange or just no progress
  const fillPercentage = isCancelledOrRejected ? 1.0 : current / total;
  const targetOffset = circumference - fillPercentage * circumference;

  const strokeDashoffset = useSharedValue(circumference); // Start empty

  useEffect(() => {
    strokeDashoffset.value = withTiming(targetOffset, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
  }, [targetOffset, strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  });

  return (
    <View
      className="flex-row items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 mb-6"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        backgroundColor: resolvedConfig.bgColor,
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
            stroke={resolvedConfig.progressColor}
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
          <Feather name={resolvedConfig.iconName} size={22} color={resolvedConfig.iconColor} />
        </View>
      </View>

      {/* Steps Metadata */}
      <View className="flex-1 justify-center bg-transparent">
        <Text className="text-base font-sans-bold text-gray-950 leading-snug">{resolvedConfig.label}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 mt-0.5" numberOfLines={2}>
          {resolvedConfig.subtitle}
        </Text>
      </View>
    </View>
  );
}

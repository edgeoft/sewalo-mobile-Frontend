import { useTranslation } from 'react-i18next';
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

function getStepConfigs(t: (key: string) => string): Record<string, StepConfig> {
  return {
    [BOOKING_STATUSES.Pending]: {
      stepNumber: 1,
      label: t('components.requestSent'),
      subtitles: {
        customer: t('components.requestSentCustomer'),
        provider: t('components.requestSentProvider'),
      },
      nextLabel: t('components.acceptStep'),
      iconName: 'send',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.Confirmed]: {
      stepNumber: 2,
      label: t('components.bookingConfirmed'),
      subtitles: {
        customer: t('components.bookingConfirmedCustomer'),
        provider: t('components.bookingConfirmedProvider'),
      },
      nextLabel: t('components.jobStartedStep'),
      iconName: 'calendar',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.InProgress]: {
      stepNumber: 3,
      label: t('components.jobStarted'),
      subtitles: {
        customer: t('components.jobStartedCustomer'),
        provider: t('components.jobStartedProvider'),
      },
      nextLabel: t('components.completedStep'),
      iconName: 'tool',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.Completed]: {
      stepNumber: 4,
      label: t('components.jobCompleted'),
      subtitles: {
        customer: t('components.jobCompletedCustomer'),
        provider: t('components.jobCompletedProvider'),
      },
      nextLabel: t('components.readyToPayStep'),
      iconName: 'award',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.ReadyToPay]: {
      stepNumber: 5,
      label: t('components.readyToPay'),
      subtitles: {
        customer: t('components.readyToPayCustomer'),
        provider: t('components.readyToPayProvider'),
      },
      nextLabel: t('components.paymentInitiatedStep'),
      iconName: 'file-text',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.PaymentInitiated]: {
      stepNumber: 6,
      label: t('components.paymentInitiated'),
      subtitles: {
        customer: t('components.paymentInitiatedCustomer'),
        provider: t('components.paymentInitiatedProvider'),
      },
      nextLabel: t('components.jobsCompletedStep'),
      iconName: 'refresh-cw',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.Paid]: {
      stepNumber: 7,
      label: t('components.jobsCompleted'),
      subtitles: {
        customer: t('components.jobsCompletedCustomer'),
        provider: t('components.jobsCompletedProvider'),
      },
      nextLabel: t('components.enjoyService'),
      iconName: 'check',
      iconColor: '#485aff',
      progressColor: '#485aff',
      bgColor: '#f4f6ff',
    },
    [BOOKING_STATUSES.Cancelled]: {
      stepNumber: 0,
      label: t('components.cancelled'),
      subtitles: {
        customer: t('components.cancelledCustomer'),
        provider: t('components.cancelledProvider'),
      },
      nextLabel: t('components.bookingCancelled'),
      iconName: 'x-circle',
      iconColor: '#ef4444',
      progressColor: '#ef4444',
      bgColor: '#fef2f2',
    },
    [BOOKING_STATUSES.Rejected]: {
      stepNumber: 0,
      label: t('components.rejected'),
      subtitles: {
        customer: t('components.rejectedCustomer'),
        provider: t('components.rejectedProvider'),
      },
      nextLabel: t('components.bookingRejected'),
      iconName: 'alert-triangle',
      iconColor: '#f97316',
      progressColor: '#f97316',
      bgColor: '#fff7ed',
    },
  };
}

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
  const { t } = useTranslation();
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
        const stepConfigs = getStepConfigs(t);
        const config = stepConfigs[status] || stepConfigs[BOOKING_STATUSES.Pending];
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
        elevation: 0,
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

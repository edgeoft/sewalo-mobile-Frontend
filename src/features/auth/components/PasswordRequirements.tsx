import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';

export interface PasswordRequirementsProps {
  password: string;
  labels: {
    title: string;
    length: string;
    uppercase: string;
    number: string;
    special: string;
    strength?: string;
    strengthWeak?: string;
    strengthMedium?: string;
    strengthStrong?: string;
  };
}

const requirements = [
  { key: 'length', test: (value: string) => value.length >= 8 },
  { key: 'uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { key: 'number', test: (value: string) => /[0-9]/.test(value) },
  { key: 'special', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

function getRequirementState(password: string, isMet: boolean) {
  if (password.length === 0) {
    return {
      icon: 'circle' as const,
      color: THEME_COLORS.slate400,
      textClassName: 'text-muted-foreground font-sans-medium',
    };
  }

  if (isMet) {
    return {
      icon: 'check-circle' as const,
      color: THEME_COLORS.emeraldSuccess,
      textClassName: 'text-emerald-600 font-sans-medium',
    };
  }

  return {
    icon: 'circle' as const,
    color: THEME_COLORS.dangerRed,
    textClassName: 'text-destructive font-sans-medium',
  };
}

export default function PasswordRequirements({ password, labels }: PasswordRequirementsProps) {
  const isStarted = password.length > 0;
  const hasStrengthMeter = Boolean(labels.strength);

  const metCount = requirements.filter((req) => req.test(password)).length;

  let strengthText = '';
  let strengthColorClass = 'bg-secondary';
  let strengthTextColorClass = 'text-muted-foreground';
  let segments = [false, false, false, false];

  if (isStarted && hasStrengthMeter) {
    if (metCount <= 2) {
      strengthText = labels.strengthWeak || 'Weak';
      strengthColorClass = 'bg-destructive';
      strengthTextColorClass = 'text-destructive';
      segments = [true, false, false, false];
    } else if (metCount === 3) {
      strengthText = labels.strengthMedium || 'Medium';
      strengthColorClass = 'bg-amber-500';
      strengthTextColorClass = 'text-amber-600';
      segments = [true, true, true, false];
    } else {
      strengthText = labels.strengthStrong || 'Strong';
      strengthColorClass = 'bg-emerald-500';
      strengthTextColorClass = 'text-emerald-600';
      segments = [true, true, true, true];
    }
  }

  return (
    <View className="mt-2.5 px-0.5 gap-y-1.5">
      {/* Optional Strength Meter */}
      {isStarted && hasStrengthMeter && (
        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-sans-medium text-muted-foreground">{labels.strength}</Text>
            <Text className={`text-xs font-sans-bold ${strengthTextColorClass}`}>{strengthText}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            {segments.map((active, index) => (
              <View
                key={index}
                className={`h-1.5 flex-1 rounded-full ${active ? strengthColorClass : 'bg-secondary'}`}
              />
            ))}
          </View>
        </View>
      )}

      {/* Requirements Title */}
      <Text className="text-xs font-sans-bold text-slate-700 mb-0.5">{labels.title}</Text>

      {/* Requirements List */}
      <View className="gap-y-1">
        {requirements.map((requirement) => {
          const state = getRequirementState(password, requirement.test(password));

          return (
            <View key={requirement.key} className="flex-row items-center">
              <Feather name={state.icon} size={12} color={state.color} style={{ marginRight: 6 }} />
              <Text className={`text-xs ${state.textClassName}`}>{labels[requirement.key]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

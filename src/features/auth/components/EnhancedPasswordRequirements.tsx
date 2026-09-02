import React from 'react';
import { Text, View } from 'react-native';

interface EnhancedPasswordRequirementsProps {
  password: string;
  labels: {
    title: string;
    length: string;
    uppercase: string;
    number: string;
    special: string;
    strength: string;
    strengthWeak: string;
    strengthMedium: string;
    strengthStrong: string;
  };
}

const requirements = [
  { key: 'length', test: (value: string) => value.length >= 8 },
  { key: 'uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { key: 'number', test: (value: string) => /[0-9]/.test(value) },
  { key: 'special', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export default function EnhancedPasswordRequirements({ password, labels }: EnhancedPasswordRequirementsProps) {
  const metCount = requirements.filter((req) => req.test(password)).length;
  const isStarted = password.length > 0;

  // Strength Level
  let strengthText = '';
  let strengthColorClass = 'bg-gray-200';
  let strengthTextColorClass = 'text-gray-500';
  let segments = [false, false, false, false];

  if (isStarted) {
    if (metCount <= 2) {
      strengthText = labels.strengthWeak;
      strengthColorClass = 'bg-destructive';
      strengthTextColorClass = 'text-destructive';
      segments = [true, false, false, false];
    } else if (metCount === 3) {
      strengthText = labels.strengthMedium;
      strengthColorClass = 'bg-amber-500';
      strengthTextColorClass = 'text-amber-600';
      segments = [true, true, true, false];
    } else {
      strengthText = labels.strengthStrong;
      strengthColorClass = 'bg-emerald-500';
      strengthTextColorClass = 'text-emerald-600';
      segments = [true, true, true, true];
    }
  }

  return (
    <View className="mt-3 px-0.5">
      {/* Password Strength Section */}
      {isStarted && (
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-sans-medium text-gray-500">{labels.strength}</Text>
            <Text className={`text-xs font-sans-bold ${strengthTextColorClass}`}>{strengthText}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            {segments.map((active, index) => (
              <View
                key={index}
                className={`h-1.5 flex-1 rounded-full ${active ? strengthColorClass : 'bg-gray-200'}`}
              />
            ))}
          </View>
        </View>
      )}

      {/* Password Requirements Title */}
      <Text className="text-xs font-sans-bold text-gray-700 mb-2">{labels.title}</Text>

      {/* Requirements bullet list */}
      <View className="gap-y-2">
        {requirements.map((req) => {
          const isMet = req.test(password);

          let bulletColorClass = 'bg-gray-300';
          let textColorClass = 'text-gray-500 font-sans-regular';

          if (isStarted) {
            if (isMet) {
              bulletColorClass = 'bg-emerald-500';
              textColorClass = 'text-emerald-700 font-sans-medium';
            } else {
              bulletColorClass = 'bg-destructive';
              textColorClass = 'text-destructive font-sans-regular';
            }
          }

          return (
            <View key={req.key} className="flex-row items-center pl-1">
              <View className={`w-1.5 h-1.5 rounded-full mr-2.5 ${bulletColorClass}`} />
              <Text className={`text-xs ${textColorClass}`}>{labels[req.key]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

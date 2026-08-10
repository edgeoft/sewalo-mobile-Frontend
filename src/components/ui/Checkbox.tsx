import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { useAppReducedMotion } from '@/utils/accessibility';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Checkbox({
  checked,
  onChange,
  label,
  className = '',
  labelClassName = '',
  disabled = false,
  size = 'md',
}: CheckboxProps) {
  const [scaleAnim] = useState(() => new Animated.Value(checked ? 1 : 0));
  const reducesMotion = useAppReducedMotion();

  useEffect(() => {
    if (reducesMotion) {
      scaleAnim.setValue(checked ? 1 : 0);
      return;
    }
    Animated.spring(scaleAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [checked, scaleAnim, reducesMotion]);

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const boxSize = size === 'sm' ? 18 : 22;
  const iconSize = size === 'sm' ? 12 : 14;
  const borderRadius = size === 'sm' ? 5 : 6;

  const resolvedLabel = typeof label === 'string' ? label : undefined;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={resolvedLabel}
      accessibilityState={{ checked, disabled }}
      className={`flex-row items-center active:opacity-80 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <View
        style={{ width: boxSize, height: boxSize, borderRadius }}
        className={`border items-center justify-center ${
          checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
        }`}
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Feather name="check" size={iconSize} color="white" />
        </Animated.View>
      </View>

      {label && (
        <View className="ml-2.5 flex-1">
          {typeof label === 'string' ? (
            <Text className={`text-sm font-sans-medium text-gray-700 ${labelClassName}`}>{label}</Text>
          ) : (
            label
          )}
        </View>
      )}
    </Pressable>
  );
}

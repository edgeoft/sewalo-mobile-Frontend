import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  className = '',
  labelClassName = '',
  disabled = false,
}: CheckboxProps) {
  const [scaleAnim] = useState(() => new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [checked, scaleAnim]);

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center active:opacity-80 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <View
        className={`w-[22px] h-[22px] rounded-md border items-center justify-center ${
          checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
        }`}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Feather name="check" size={14} color="white" />
        </Animated.View>
      </View>

      {label && (
        <View className="ml-2.5">
          {typeof label === 'string' ? (
            <Text className={`text-[14px] font-sans-medium text-gray-700 ${labelClassName}`}>{label}</Text>
          ) : (
            label
          )}
        </View>
      )}
    </Pressable>
  );
}

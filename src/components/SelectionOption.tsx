import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export interface SelectionOptionProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  iconStyle?: 'pill' | 'plain';
  indicatorType?: 'radio' | 'checkbox' | 'none';
  gradientColors?: [string, string];
  className?: string;
}

export default function SelectionOption({
  title,
  subtitle,
  selected,
  onPress,
  icon,
  iconStyle = 'pill',
  indicatorType = 'radio',
  gradientColors = ['#e8ebff', '#f8fafc'],
  className = '',
}: SelectionOptionProps) {
  const [opacityAnim] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: selected ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [selected, opacityAnim]);

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl border overflow-hidden relative ${
        selected ? 'border-primary' : 'border-gray-200'
      } bg-white ${className}`}
    >
      {/* Animated Linear Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View className="flex-row items-center py-4 px-5 bg-transparent">
        {/* Left Icon */}
        {icon && (
          <View
            className={
              iconStyle === 'plain'
                ? 'items-center justify-center mr-3'
                : `w-9 h-9 rounded-full items-center justify-center mr-3 ${selected ? 'bg-primary/10' : 'bg-gray-50'}`
            }
          >
            {icon}
          </View>
        )}

        {/* Text Area */}
        <View className="flex-1">
          <Text className="text-[15px] font-sans-bold text-gray-900">{title}</Text>
          {subtitle && <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">{subtitle}</Text>}
        </View>

        {/* Right Indicator */}
        {indicatorType === 'radio' && (
          <View
            className={`w-4 h-4 rounded-full border items-center justify-center ${
              selected ? 'border-primary' : 'border-gray-300'
            }`}
          >
            {selected && <View className="w-2 h-2 rounded-full bg-primary" />}
          </View>
        )}

        {indicatorType === 'checkbox' && (
          <View
            className={`w-4.5 h-4.5 rounded border items-center justify-center ${
              selected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
            }`}
          >
            {selected && <Feather name="check" size={11} color="white" />}
          </View>
        )}
      </View>
    </Pressable>
  );
}

import React, { useState } from 'react';
import { StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  className?: string;
  inputClassName?: string;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  className = '',
  inputClassName = '',
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={containerStyle} className={`w-full ${className}`}>
      {label && <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{label}</Text>}

      <View
        className={`form-input-container ${
          error ? 'form-input-container-error' : isFocused ? 'form-input-container-focus' : ''
        }`}
        style={{
          shadowColor: isFocused ? '#485aff' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.08 : 0.015,
          shadowRadius: isFocused ? 4 : 2,
          elevation: isFocused ? 2 : 0,
        }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#898f8f"
          style={[{ includeFontPadding: false, textAlignVertical: 'center', lineHeight: undefined }, inputStyle]}
          className={`form-input-text ${inputClassName}`}
          {...props}
        />

        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>

      {error && <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{error}</Text>}
    </View>
  );
}

import React, { useId, useState } from 'react';
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
  containerClassName?: string;
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
  containerClassName = '',
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const labelId = useId();

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={containerStyle} className={`w-full ${className}`}>
      {label && (
        <Text nativeID={labelId} className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
          {label}
        </Text>
      )}

      <View
        className={`form-input-container ${
          props.multiline ? 'form-input-container-multiline' : 'form-input-container-single'
        } ${error ? 'form-input-container-error' : isFocused ? 'form-input-container-focus' : ''} ${containerClassName}`}
        style={{
          shadowColor: isFocused ? '#485aff' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.08 : 0.015,
          shadowRadius: isFocused ? 4 : 2,
          elevation: isFocused ? 2 : 0,
        }}
      >
        {leftIcon && (
          <View className="mr-3" importantForAccessibility="no" accessibilityElementsHidden>
            {leftIcon}
          </View>
        )}

        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#898f8f"
          style={[{ includeFontPadding: false, textAlignVertical: 'center' }, inputStyle]}
          className={`form-input-text ${inputClassName}`}
          accessibilityLabel={label}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityState={{ disabled: props.editable === false }}
          accessibilityHint={error}
          {...props}
        />

        {rightIcon && (
          <View className="ml-3" importantForAccessibility="no" accessibilityElementsHidden>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text accessibilityLiveRegion="polite" className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}

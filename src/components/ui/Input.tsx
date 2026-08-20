import React, { useId, useRef, useState } from 'react';
import { Pressable, StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

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
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleContainerPress = () => {
    if (props.editable !== false) {
      inputRef.current?.focus();
    }
  };

  return (
    <View style={containerStyle} className={`w-full ${className}`}>
      {label && (
        <Text nativeID={labelId} className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
          {label}
        </Text>
      )}

      <Pressable
        onPress={handleContainerPress}
        className={`form-input-container ${
          props.multiline ? 'form-input-container-multiline' : 'form-input-container-single'
        } ${error ? 'form-input-container-error' : isFocused ? 'form-input-container-focus' : ''} ${containerClassName}`}
      >
        {leftIcon && (
          <View className="mr-3" importantForAccessibility="no" accessibilityElementsHidden>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#94a3b8"
          numberOfLines={props.multiline ? props.numberOfLines : 1}
          multiline={props.multiline ?? false}
          style={[
            {
              includeFontPadding: false,
              textAlignVertical: props.multiline ? 'top' : 'center',
              paddingVertical: 0,
              paddingTop: 0,
              paddingBottom: 0,
            },
            inputStyle,
          ]}
          className={`form-input-text min-w-0 ${inputClassName}`}
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
      </Pressable>

      {error && (
        <Text accessibilityLiveRegion="polite" className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}

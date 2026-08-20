import React, { useRef, useState } from 'react';
import { Pressable, StyleProp, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/colors';

export interface SearchBarProps extends Omit<TextInputProps, 'multiline' | 'numberOfLines'> {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  onPress?: () => void;
  placeholder?: string;
  iconPosition?: 'left' | 'right';
  showClearButton?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  editable?: boolean;
  accessibilityLabel?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  onPress,
  placeholder = 'Search...',
  iconPosition = 'left',
  showClearButton = true,
  containerClassName = '',
  inputClassName = '',
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  editable = true,
  accessibilityLabel,
  onFocus,
  onBlur,
  returnKeyType = 'search',
  ...props
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isInteractiveButton = !!onPress && editable === false;

  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleContainerPress = () => {
    if (onPress) {
      onPress();
    } else if (editable !== false) {
      inputRef.current?.focus();
    }
  };

  // Render left icon
  const renderLeftIcon = () => {
    if (leftIcon) {
      return (
        <View className="mr-2.5 items-center justify-center" importantForAccessibility="no">
          {leftIcon}
        </View>
      );
    }
    if (iconPosition === 'left') {
      return (
        <View className="mr-2.5 items-center justify-center" importantForAccessibility="no">
          <Feather name="search" size={18} color={isFocused ? THEME_COLORS.primary : THEME_COLORS.slate400} />
        </View>
      );
    }
    return null;
  };

  // Render right icon or clear button
  const renderRightIcon = () => {
    if (showClearButton && value && value.length > 0 && editable) {
      return (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
          className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-slate-100 active:opacity-70"
        >
          <Feather name="x" size={13} color={THEME_COLORS.slate500} />
        </Pressable>
      );
    }
    if (rightIcon) {
      return (
        <View className="ml-2.5 items-center justify-center" importantForAccessibility="no">
          {rightIcon}
        </View>
      );
    }
    if (iconPosition === 'right') {
      return (
        <View className="ml-2.5 items-center justify-center" importantForAccessibility="no">
          <Feather name="search" size={18} color={isFocused ? THEME_COLORS.primary : THEME_COLORS.primary} />
        </View>
      );
    }
    return null;
  };

  const content = (
    <View
      style={[
        {
          borderRadius: 10,
        },
        containerStyle,
      ]}
      className={`h-12 w-full flex-row items-center border px-3.5 bg-white ${
        isFocused ? 'border-primary' : 'border-gray-200'
      } ${containerClassName}`}
    >
      {renderLeftIcon()}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME_COLORS.slate400}
        editable={editable && !isInteractiveButton}
        numberOfLines={1}
        multiline={false}
        returnKeyType={returnKeyType}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          {
            includeFontPadding: false,
            textAlignVertical: 'center',
            paddingVertical: 0,
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: 14,
          },
          inputStyle,
        ]}
        className={`flex-1 text-slate-900 font-sans-medium py-0 self-stretch min-w-0 ${inputClassName}`}
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityRole={isInteractiveButton ? 'button' : 'search'}
        {...props}
      />

      {renderRightIcon()}
    </View>
  );

  if (isInteractiveButton) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || placeholder}
        className="w-full active:opacity-90"
      >
        <View pointerEvents="none">{content}</View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handleContainerPress} className="w-full">
      {content}
    </Pressable>
  );
}

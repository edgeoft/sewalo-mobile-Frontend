import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'none';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  className?: string;
  textClassName?: string;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  className = '',
  textClassName = '',
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-primary border-primary active:opacity-90',
    secondary: 'bg-secondary border-secondary active:opacity-90',
    outline: 'bg-transparent border border-white/20 active:bg-white/10',
    ghost: 'bg-transparent border-transparent active:opacity-60',
    light: 'bg-white border-white active:bg-white/90',
  };

  const textVariantStyles = {
    primary: 'text-white font-sans-semibold',
    secondary: 'text-white font-sans-semibold',
    outline: 'text-white font-sans-semibold',
    ghost: 'text-white font-sans-semibold',
    light: 'text-primary font-sans-semibold',
  };

  const sizeStyles = {
    none: 'p-0 border-0',
    sm: 'py-2 px-4 rounded-lg',
    md: 'py-3 px-4 rounded-lg',
    lg: 'py-4 px-8 rounded-lg',
  };

  const textSizeStyles = {
    none: '',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={style}
      disabled={isDisabled}
      className={`flex-row items-center justify-center border ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'light' ? '#485aff' : '#ffffff'} className="mr-2" />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-1">{leftIcon}</View>}
          <Text
            style={textStyle}
            className={`${textVariantStyles[variant]} ${textSizeStyles[size]} text-center ${textClassName}`}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-1">{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

import React from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';

interface OnboardingStickyFooterProps {
  primaryTitle: string;
  onPrimaryPress: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  primaryVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light';
  primaryRightIcon?: React.ReactNode;
  primaryLeftIcon?: React.ReactNode;
  secondaryTitle?: string;
  onSecondaryPress?: () => void;
  secondaryVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light';
  secondaryDisabled?: boolean;
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
}

export default function OnboardingStickyFooter({
  primaryTitle,
  onPrimaryPress,
  primaryLoading = false,
  primaryDisabled = false,
  primaryVariant = 'primary',
  primaryRightIcon,
  primaryLeftIcon,
  secondaryTitle,
  onSecondaryPress,
  secondaryVariant = 'ghost',
  secondaryDisabled = false,
  containerClassName = '',
  style,
}: OnboardingStickyFooterProps) {
  const insets = useSafeAreaInsets();

  // Balanced vertical spacing: provides comfortable distance from bottom gesture/nav bar
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 6 : 16;

  return (
    <View
      style={[
        {
          paddingTop: 12,
          paddingBottom: bottomPadding,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 0 : 10,
        },
        style,
      ]}
      className={`bg-white border-t border-gray-100 w-full px-5 ${secondaryTitle ? 'gap-y-2' : ''} ${containerClassName}`}
    >
      <Button
        title={primaryTitle}
        onPress={onPrimaryPress}
        loading={primaryLoading}
        disabled={primaryDisabled}
        variant={primaryVariant}
        size="md"
        leftIcon={primaryLeftIcon}
        rightIcon={primaryRightIcon}
        className="w-full bg-primary"
      />

      {secondaryTitle && onSecondaryPress && (
        <Button
          title={secondaryTitle}
          onPress={onSecondaryPress}
          disabled={secondaryDisabled || primaryLoading}
          variant={secondaryVariant}
          size="md"
          className="w-full border border-gray-200 active:bg-gray-50"
          textClassName="text-gray-600 font-sans-bold"
        />
      )}
    </View>
  );
}

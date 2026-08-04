import React from 'react';
import { Text, View } from 'react-native';
import Button from '@/components/ui/Button';

export interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  className?: string;
}

export default function EmptyStateCard({
  icon,
  title,
  description,
  buttonTitle,
  onButtonPress,
  className = '',
}: EmptyStateCardProps) {
  return (
    <View className={`rounded-2xl border border-gray-200 bg-white px-5 py-8 items-center ${className}`}>
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-sm font-sans-semibold text-gray-900 mb-1 text-center">{title}</Text>
      <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-5 px-4">{description}</Text>
      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          variant="primary"
          size="sm"
          onPress={onButtonPress}
          className="w-full max-w-[200px]"
        />
      )}
    </View>
  );
}

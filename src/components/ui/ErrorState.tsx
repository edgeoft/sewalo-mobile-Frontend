import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

/** Shared query/network error state with optional retry. */
export default function ErrorState({ title, description, retryLabel, onRetry, className = '' }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <View className={`rounded-2xl border border-red-100 bg-white px-5 py-8 items-center ${className}`}>
      <View className="mb-4">
        <Feather name="cloud-off" size={28} color="#ef4444" accessible={false} />
      </View>
      <Text className="text-sm font-sans-semibold text-gray-900 mb-1 text-center">
        {title ?? t('common.errorTitle')}
      </Text>
      <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-5 px-4">
        {description ?? t('common.errorDesc')}
      </Text>
      {onRetry && (
        <Button
          title={retryLabel ?? t('common.tryAgain')}
          variant="outline"
          size="sm"
          onPress={onRetry}
          className="w-full max-w-[200px]"
        />
      )}
    </View>
  );
}

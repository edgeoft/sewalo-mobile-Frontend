import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';

interface ServiceStickyFooterProps {
  onSave: () => void;
  disabled?: boolean;
  loading?: boolean;
  infoMessage?: string;
  errorMessage?: string;
}

export default function ServiceStickyFooter({
  onSave,
  disabled = false,
  loading = false,
  infoMessage,
  errorMessage,
}: ServiceStickyFooterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Safe spacing matching bottom tab bar
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 16;

  return (
    <View
      style={{
        paddingBottom: bottomPadding,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 10,
      }}
      className="bg-white border-t border-gray-100 w-full px-5 pt-3 absolute bottom-0 left-0 right-0"
    >
      {/* Top Message Indicators */}
      {errorMessage ? (
        <Text className="text-xs font-sans-semibold text-destructive text-center mb-2.5">{errorMessage}</Text>
      ) : infoMessage ? (
        <Text className="text-xs font-sans-semibold text-emerald-600 text-center mb-2.5">{infoMessage}</Text>
      ) : null}

      <Button
        title={t('provider.saveDetails')}
        variant="primary"
        loading={loading}
        disabled={disabled}
        onPress={onSave}
        className="w-full"
      />
    </View>
  );
}

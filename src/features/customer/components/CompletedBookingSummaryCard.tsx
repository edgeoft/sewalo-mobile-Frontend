import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

interface CompletedBookingSummaryCardProps {
  totalPayableValue: number;
  onDownloadInvoice: () => void;
  onShareInvoice?: () => void;
  onRateProvider?: () => void;
}

function CompletedBookingSummaryCard({
  totalPayableValue,
  onDownloadInvoice,
  onShareInvoice,
  onRateProvider,
}: CompletedBookingSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-base font-sans-bold text-gray-900">{t('customer.totalPaid')}</Text>
        <Text className="text-lg font-sans-bold text-gray-900">Rs. {totalPayableValue.toLocaleString()}</Text>
      </View>

      <View className="mt-4 gap-3">
        <View className="flex-row items-center gap-2">
          <Button
            title={t('customer.downloadInvoice')}
            onPress={onDownloadInvoice}
            className="flex-1 border-gray-200 bg-white active:bg-gray-50 h-12"
            textClassName="text-gray-900 font-sans-semibold"
            leftIcon={<Feather name="download" size={16} color={THEME_COLORS.slate900} />}
          />
          {onShareInvoice && (
            <Pressable
              onPress={onShareInvoice}
              accessibilityRole="button"
              accessibilityLabel={t('customer.shareInvoice')}
              className="h-12 w-12 rounded-xl border border-gray-200 bg-white active:bg-gray-50 items-center justify-center"
            >
              <Feather name="share-2" size={16} color={THEME_COLORS.slate900} />
            </Pressable>
          )}
        </View>
        {onRateProvider && (
          <Button
            title={t('customer.rateProvider')}
            variant="primary"
            onPress={onRateProvider}
            className="h-12"
            leftIcon={<Feather name="star" size={16} color={THEME_COLORS.primaryForeground} />}
          />
        )}
      </View>
    </View>
  );
}

export default memo(CompletedBookingSummaryCard);

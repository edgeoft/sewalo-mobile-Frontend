import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';
import { DISCOUNT_TYPES } from '@/constants/loyalty';
import type { Coupon } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SheetContainer from '@/components/ui/SheetContainer';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { formatDate } from '@/utils/time';

interface ApplyCouponModalProps {
  visible: boolean;
  onClose: () => void;
  availableCoupons: Coupon[];
  selectedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon) => void;
  subtotal: number;
}

export default function ApplyCouponModal({
  visible,
  onClose,
  availableCoupons,
  selectedCoupon,
  onApplyCoupon,
  subtotal,
}: ApplyCouponModalProps) {
  const { t } = useTranslation();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const validateAndApply = (coupon: Coupon): boolean => {
    const now = new Date();

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      setCouponError(t('customer.couponExpired'));
      return false;
    }

    if (coupon.start_date && new Date(coupon.start_date) > now) {
      setCouponError(t('customer.couponNotYetActive'));
      return false;
    }

    if (coupon.remaining_uses !== null && coupon.remaining_uses !== undefined && coupon.remaining_uses <= 0) {
      setCouponError(t('customer.couponLimitReached'));
      return false;
    }

    const discount =
      coupon.discount_type === DISCOUNT_TYPES.PERCENT
        ? (Number(coupon.discount_value) / 100) * subtotal
        : Number(coupon.discount_value);

    if (subtotal > 0 && discount >= subtotal) {
      setCouponError(t('customer.couponExceedsSubtotal'));
      return false;
    }

    setCouponError('');
    onApplyCoupon(coupon);
    onClose();
    return true;
  };

  const handleManualApply = () => {
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError(t('customer.enterCouponCode'));
      return;
    }

    const foundCoupon = availableCoupons.find((c) => c.code.trim().toUpperCase() === cleanCode);
    if (!foundCoupon) {
      setCouponError(t('customer.invalidCoupon'));
      return;
    }

    validateAndApply(foundCoupon);
  };

  const handleSelectOffer = (coupon: Coupon) => {
    validateAndApply(coupon);
  };

  return (
    <SheetContainer
      visible={visible}
      onClose={onClose}
      title={t('customer.applyCouponAndOffers')}
      maxHeightRatio={0.88}
    >
      <View className="gap-y-5">
        {/* Manual Coupon Input */}
        <View>
          <Text className="text-xs font-sans-bold text-gray-950 mb-1.5 uppercase tracking-wide ml-0.5">
            {t('customer.applyCoupon')}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                placeholder={t('customer.enterCouponCode')}
                value={couponInput}
                onChangeText={(text) => {
                  setCouponInput(text.toUpperCase());
                  if (couponError) setCouponError('');
                }}
                autoCapitalize="characters"
                className="h-11"
                inputClassName="text-sm font-sans-semibold text-gray-900 tracking-wider"
              />
            </View>
            <Button
              title={t('customer.apply')}
              variant="primary"
              size="sm"
              onPress={handleManualApply}
              className="h-11 px-4 min-w-[76px]"
              disabled={!couponInput.trim()}
            />
          </View>
          {couponError ? (
            <View className="flex-row items-center mt-1.5 ml-1 gap-1">
              <Feather name="alert-circle" size={12} color={THEME_COLORS.dangerRed} />
              <Text className="text-xs font-sans-medium text-red-500 flex-1">{couponError}</Text>
            </View>
          ) : null}
        </View>

        {/* Available Offers Section */}
        <View>
          <View className="flex-row items-center mb-3">
            <Feather name="tag" size={14} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-bold text-gray-950 uppercase tracking-wide ml-1.5">
              {t('customer.availableOffers')} ({availableCoupons.length})
            </Text>
          </View>

          {availableCoupons.length > 0 ? (
            <View className="gap-y-3">
              {availableCoupons.map((coupon) => {
                const isSelected = selectedCoupon?.id === coupon.id;
                const discountDisplay =
                  coupon.discount_type === DISCOUNT_TYPES.PERCENT
                    ? `${coupon.discount_value}% OFF`
                    : `Rs. ${Number(coupon.discount_value).toLocaleString()} OFF`;

                return (
                  <View
                    key={coupon.id}
                    style={styles.offerCardShadow}
                    className={`p-4 rounded-xl border ${
                      isSelected ? 'border-primary bg-surface-indigo-subtle/50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                        <Text className="text-xs font-sans-extrabold text-primary tracking-wider">{coupon.code}</Text>
                      </View>
                      <Button
                        title={isSelected ? t('common.applied', 'Applied') : t('customer.apply')}
                        variant={isSelected ? 'outline' : 'primary'}
                        size="sm"
                        onPress={() => handleSelectOffer(coupon)}
                        className={`h-8 px-3 ${isSelected ? 'border-primary bg-white' : ''}`}
                        textClassName={isSelected ? 'text-primary font-sans-bold text-xs' : 'font-sans-bold text-xs'}
                      />
                    </View>

                    <Text className="text-sm font-sans-bold text-gray-900">{coupon.name}</Text>

                    <Text className="text-xs font-sans-semibold text-green-700 mt-0.5">{discountDisplay}</Text>

                    <View className="flex-row items-center mt-3 pt-2.5 border-t border-gray-100 gap-x-1.5 flex-wrap">
                      <Feather name="clock" size={11} color="#94a3b8" />
                      {coupon.end_date ? (
                        <Text className="text-[11px] font-sans-medium text-gray-500">
                          {t('customer.validUntil', { date: formatDate(coupon.end_date) })}
                        </Text>
                      ) : null}
                      {coupon.remaining_uses !== null && coupon.remaining_uses !== undefined && (
                        <Text className="text-[11px] font-sans-medium text-gray-400">
                          • {t('customer.usesLeft', { count: coupon.remaining_uses })}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyStateCard
              icon={<Feather name="tag" size={32} color={THEME_COLORS.slate400} />}
              title={t('customer.noCouponsAvailable')}
              description={t('customer.noCouponsAvailableDesc')}
              className="py-6 border-dashed"
            />
          )}
        </View>
      </View>
    </SheetContainer>
  );
}

const styles = StyleSheet.create({
  offerCardShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
});

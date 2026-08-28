import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';
import { DISCOUNT_TYPES } from '@/constants/loyalty';
import type { Coupon } from '@/types';
import ApplyCouponModal from './ApplyCouponModal';

interface DiscountLoyaltyCardProps {
  selectedCoupon: Coupon | null;
  onSelectCoupon: (coupon: Coupon | null) => void;
  loyaltyPoints: string;
  onChangeLoyaltyPoints: (points: string) => void;
  onApplyMaxPoints?: () => void;
  loyaltyBalance: number;
  pointsRate: number;
  availableCoupons: Coupon[];
  subtotal: number;
}

export default function DiscountLoyaltyCard({
  selectedCoupon,
  onSelectCoupon,
  loyaltyPoints,
  onChangeLoyaltyPoints,
  onApplyMaxPoints,
  loyaltyBalance,
  pointsRate,
  availableCoupons,
  subtotal,
}: DiscountLoyaltyCardProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  const pointsValue = ((parseInt(loyaltyPoints, 10) || 0) * pointsRate).toFixed(2);

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
    setCouponInput('');
    onSelectCoupon(coupon);
    showSnackbar({ message: t('customer.couponApplied'), type: 'success' });
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

  const handleRemoveCoupon = () => {
    onSelectCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  return (
    <View className="gap-y-4">
      {/* Coupon Selection */}
      <View>
        <Text className="text-xs font-sans-bold text-gray-950 mb-1.5 uppercase tracking-wide ml-0.5">
          {t('customer.applyCoupon')}
        </Text>

        {selectedCoupon ? (
          /* Applied Coupon State */
          <View className="p-3 rounded-xl border border-green-200 bg-green-50/70 flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center gap-1.5 flex-wrap">
                <Feather name="check-circle" size={14} color="#16a34a" />
                <View className="bg-green-100 border border-green-200 rounded px-1.5 py-0.5">
                  <Text className="text-[10px] font-sans-extrabold text-green-800 tracking-wider">
                    {selectedCoupon.code}
                  </Text>
                </View>
                <Text className="text-xs font-sans-bold text-gray-900" numberOfLines={1}>
                  {selectedCoupon.name}
                </Text>
              </View>
              <Text className="text-xs font-sans-semibold text-green-700 mt-1 ml-5">
                {selectedCoupon.discount_type === DISCOUNT_TYPES.PERCENT
                  ? `${selectedCoupon.discount_value}% OFF`
                  : `Rs. ${Number(selectedCoupon.discount_value).toLocaleString()} OFF`}
              </Text>
            </View>

            <Pressable
              onPress={handleRemoveCoupon}
              accessibilityRole="button"
              accessibilityLabel={t('components.removeCoupon')}
              hitSlop={8}
              className="p-2 rounded-full bg-white border border-red-100 active:bg-red-50"
            >
              <Feather name="trash-2" size={13} color={THEME_COLORS.dangerRed} />
            </Pressable>
          </View>
        ) : (
          /* Unapplied Coupon Input State */
          <View>
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

            {/* View Available Offers Banner */}
            {availableCoupons.length > 0 && (
              <Pressable
                onPress={() => setIsOffersModalOpen(true)}
                accessibilityRole="button"
                className="mt-2.5 px-3 py-2.5 rounded-lg border border-primary/20 bg-primary/5 flex-row items-center justify-between active:bg-primary/10"
              >
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                    <Feather name="tag" size={12} color={THEME_COLORS.primary} />
                  </View>
                  <Text className="text-xs font-sans-semibold text-primary flex-1" numberOfLines={1}>
                    {t('customer.availableOffersCount', { count: availableCoupons.length })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs font-sans-bold text-primary">{t('customer.viewAllOffers')}</Text>
                  <Feather name="chevron-right" size={13} color={THEME_COLORS.primary} />
                </View>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Loyalty Points */}
      <View>
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-xs font-sans-bold text-gray-950 uppercase tracking-wide ml-0.5">
            {t('components.redeemLoyaltyPoints')}
          </Text>
          <View className="flex-row items-center gap-x-2">
            <Text className="text-xs font-sans-bold text-primary">
              {t('components.balancePts', { balance: loyaltyBalance })}
            </Text>
            {onApplyMaxPoints && loyaltyBalance > 0 && (
              <Pressable
                onPress={onApplyMaxPoints}
                accessibilityRole="button"
                className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20 active:bg-primary/20"
              >
                <Text className="text-[10px] font-sans-bold text-primary">{t('customer.applyMax', 'Max')}</Text>
              </Pressable>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Input
              placeholder={t('components.enterPoints')}
              keyboardType="numeric"
              value={loyaltyPoints}
              onChangeText={onChangeLoyaltyPoints}
              editable={loyaltyBalance > 0}
              className="h-11"
              inputClassName="text-sm font-sans-medium text-gray-900"
            />
          </View>
          <View className="h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 justify-center min-w-[90px]">
            <Text className="text-[10px] font-sans-medium text-gray-500 text-center">{t('common.value')}</Text>
            <Text className="text-xs font-sans-bold text-gray-900 text-center">Rs. {pointsValue}</Text>
          </View>
        </View>
      </View>

      {/* Dedicated Offers Sheet Modal */}
      <ApplyCouponModal
        visible={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        availableCoupons={availableCoupons}
        selectedCoupon={selectedCoupon}
        onApplyCoupon={(coupon) => {
          validateAndApply(coupon);
        }}
        subtotal={subtotal}
      />
    </View>
  );
}

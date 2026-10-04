import { useState } from 'react';
import type { Coupon as BookingCoupon } from '@/types';
import { LOYALTY_POINTS_VALUE, MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE, DISCOUNT_TYPES } from '@/constants/loyalty';

interface UseBookingPaymentStateOptions {
  subtotal: number;
  currentLoyaltyPoints: number;
  showSnackbar: (options: { message: string; type?: 'success' | 'error' | 'info' }) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function useBookingPaymentState({
  subtotal,
  currentLoyaltyPoints,
  showSnackbar,
  t,
}: UseBookingPaymentStateOptions) {
  const [selectedCoupon, setSelectedCoupon] = useState<BookingCoupon | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<string>('');

  const pointsValue = LOYALTY_POINTS_VALUE;

  let discountAmount = 0;
  if (selectedCoupon) {
    if (selectedCoupon.discount_type === DISCOUNT_TYPES.PERCENT) {
      discountAmount = (Number(selectedCoupon.discount_value) / 100) * subtotal;
    } else {
      discountAmount = Number(selectedCoupon.discount_value);
    }
  }

  const maxPayableWithPoints = (subtotal - discountAmount) * MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE;
  const maxPointsAllowed = Math.max(0, Math.floor(maxPayableWithPoints / pointsValue));
  const effectiveMaxPoints = Math.min(currentLoyaltyPoints, maxPointsAllowed);

  const resolvedPoints = parseInt(loyaltyPoints, 10) || 0;
  const pointsDiscount = resolvedPoints * pointsValue;
  const totalDiscount = discountAmount + pointsDiscount;
  const totalPayableValue = Math.max(subtotal - totalDiscount, 0);

  const handleLoyaltyPointsChange = (val: string) => {
    const numericText = val.replace(/[^0-9]/g, '');
    if (numericText === '') {
      setLoyaltyPoints('');
      return;
    }

    const num = Number(numericText);
    if (num > currentLoyaltyPoints) {
      showSnackbar({ message: t('customer.onlyLoyaltyPoints', { balance: currentLoyaltyPoints }), type: 'info' });
      setLoyaltyPoints(effectiveMaxPoints > 0 ? effectiveMaxPoints.toString() : '');
      return;
    }

    if (num > maxPointsAllowed) {
      showSnackbar({ message: t('customer.maxRedeemPoints', { maxPoints: maxPointsAllowed }), type: 'info' });
      setLoyaltyPoints(maxPointsAllowed.toString());
      return;
    }

    setLoyaltyPoints(numericText);
  };

  const handleApplyMaxPoints = () => {
    if (effectiveMaxPoints > 0) {
      setLoyaltyPoints(effectiveMaxPoints.toString());
    }
  };

  const handleSelectCoupon = (coupon: BookingCoupon | null) => {
    setSelectedCoupon(coupon);
    if (loyaltyPoints) {
      let newDiscount = 0;
      if (coupon) {
        newDiscount =
          coupon.discount_type === DISCOUNT_TYPES.PERCENT
            ? (Number(coupon.discount_value) / 100) * subtotal
            : Number(coupon.discount_value);
      }
      const newMaxPayable = (subtotal - newDiscount) * MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE;
      const newMaxPoints = Math.max(0, Math.floor(newMaxPayable / pointsValue));
      const currentPts = parseInt(loyaltyPoints, 10) || 0;
      if (currentPts > newMaxPoints) {
        setLoyaltyPoints(newMaxPoints > 0 ? newMaxPoints.toString() : '');
      }
    }
  };

  return {
    selectedCoupon,
    setSelectedCoupon,
    loyaltyPoints,
    setLoyaltyPoints,
    pointsValue,
    discountAmount,
    pointsDiscount,
    totalDiscount,
    totalPayableValue,
    resolvedPoints,
    effectiveMaxPoints,
    handleLoyaltyPointsChange,
    handleApplyMaxPoints,
    handleSelectCoupon,
  };
}

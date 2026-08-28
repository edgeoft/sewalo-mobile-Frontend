export const LOYALTY_POINTS_VALUE = 0.1;
export const MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE = 0.9;

export const DISCOUNT_TYPES = {
  PERCENT: 'percent',
  FIXED: 'fixed',
} as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];

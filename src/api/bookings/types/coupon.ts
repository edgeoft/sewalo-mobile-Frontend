export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  discount_type: DiscountType;
  discount_value: number;
  max_use: number;
  assigned_date: string;
  used_count: number;
  remaining_uses: number;
}

export interface GetApplicableCouponsResponse {
  data: Coupon[];
}

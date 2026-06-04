import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Input from '@/components/ui/Input';

export interface Coupon {
  code: string;
  description: string;
  discountType: 'fixed' | 'percent';
  value: number;
}

interface DiscountLoyaltyCardProps {
  selectedCoupon: Coupon | null;
  onSelectCoupon: (coupon: Coupon | null) => void;
  loyaltyPoints: string;
  onChangeLoyaltyPoints: (points: string) => void;
  loyaltyBalance: number;
  pointsRate: number;
  availableCoupons: Coupon[];
}

export default function DiscountLoyaltyCard({
  selectedCoupon,
  onSelectCoupon,
  loyaltyPoints,
  onChangeLoyaltyPoints,
  loyaltyBalance,
  pointsRate,
  availableCoupons,
}: DiscountLoyaltyCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  const pointsValue = (parseInt(loyaltyPoints) || 0) * pointsRate;

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4" style={cardShadow}>
      <Text className="text-base font-sans-bold text-gray-900 mb-3">Discount & Loyalty Points</Text>

      {/* Coupon Selection Button */}
      <View className="mb-4">
        <Text className="text-xs font-sans-medium text-gray-500 mb-1.5">Apply Coupon</Text>
        <Pressable
          onPress={() => setDropdownOpen(true)}
          className="flex-row items-center justify-between border border-gray-200 rounded-lg h-12 px-3 bg-white active:bg-gray-50"
        >
          <Text className={`text-sm font-sans-medium ${selectedCoupon ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedCoupon ? `${selectedCoupon.code} - ${selectedCoupon.description}` : 'Select a coupon'}
          </Text>
          <Feather name="chevron-down" size={18} color="#64748b" />
        </Pressable>

        {/* Coupon Selection Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={dropdownOpen}
          onRequestClose={() => setDropdownOpen(false)}
        >
          <Pressable
            className="flex-1 justify-center items-center bg-black/40 p-5"
            onPress={() => setDropdownOpen(false)}
          >
            <View className="w-full max-w-[340px] bg-white rounded-2xl border border-gray-200 p-4 shadow-xl">
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <Text className="text-base font-sans-bold text-gray-900">Available Coupons</Text>
                <Pressable onPress={() => setDropdownOpen(false)}>
                  <Feather name="x" size={20} color="#64748b" />
                </Pressable>
              </View>

              <View className="gap-2">
                {availableCoupons.map((coupon) => (
                  <Pressable
                    key={coupon.code}
                    onPress={() => {
                      onSelectCoupon(selectedCoupon?.code === coupon.code ? null : coupon);
                      setDropdownOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-3 py-3 border border-gray-200 rounded-xl active:bg-gray-50 ${
                      selectedCoupon?.code === coupon.code ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-sans-bold text-gray-900">{coupon.code}</Text>
                      <Text className="text-xs font-sans-medium text-gray-500">{coupon.description}</Text>
                    </View>
                    {selectedCoupon?.code === coupon.code && <Feather name="check" size={16} color="#485aff" />}
                  </Pressable>
                ))}
              </View>

              {selectedCoupon && (
                <Pressable
                  onPress={() => {
                    onSelectCoupon(null);
                    setDropdownOpen(false);
                  }}
                  className="mt-4 py-2.5 items-center bg-red-50 border border-red-100 rounded-xl active:bg-red-100"
                >
                  <Text className="text-xs font-sans-semibold text-red-600">Remove Applied Coupon</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Modal>
      </View>

      {/* Loyalty Points input field */}
      <View>
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-xs font-sans-medium text-gray-500">Redeem Loyalty Points</Text>
          <Text className="text-xs font-sans-bold text-primary">Balance: {loyaltyBalance} pts</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Input
              placeholder="Enter points to redeem"
              keyboardType="numeric"
              value={loyaltyPoints}
              onChangeText={onChangeLoyaltyPoints}
              className="h-12"
              inputClassName="text-sm font-sans-medium text-gray-900"
            />
          </View>
          <View className="h-12 px-3 border border-gray-200 rounded-lg bg-gray-50 justify-center min-w-[90px]">
            <Text className="text-xs font-sans-medium text-gray-500 text-center">Value</Text>
            <Text className="text-xs font-sans-bold text-gray-900 text-center">Rs. {pointsValue}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'fixed' | 'percent';
  value: number;
  remaining_uses: number;
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
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { height } = useWindowDimensions();

  const pointsValue = (parseInt(loyaltyPoints) || 0) * pointsRate;

  return (
    <View className="gap-y-4">
      {/* Coupon Selection */}
      <View>
        <Text className="text-xs font-sans-bold text-gray-950 mb-1.5 uppercase tracking-wide ml-0.5">
          {t('customer.applyCoupon')}
        </Text>
        <Pressable
          onPress={() => setDropdownOpen(true)}
          className="form-input-container form-input-container-single"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 2,
            elevation: 0,
          }}
        >
          {selectedCoupon ? (
            <View className="flex-1 mr-2">
              <Text className="text-sm font-sans-semibold text-gray-900">{selectedCoupon.name}</Text>
              <Text className="text-xs font-sans-medium text-gray-500">
                {selectedCoupon.code} -{' '}
                {selectedCoupon.discountType === 'percent' ? `${selectedCoupon.value}%` : `Rs. ${selectedCoupon.value}`}{' '}
                off
              </Text>
            </View>
          ) : (
            <Text className="form-input-text flex-1 text-[#898f8f]">Select a coupon</Text>
          )}
          <View className="ml-3">
            <Feather name="chevron-down" size={16} color="#9ca3af" />
          </View>
        </Pressable>
        {selectedCoupon && (
          <Pressable onPress={() => onSelectCoupon(null)} className="flex-row items-center mt-2">
            <Feather name="x" size={12} color="#ef4444" />
            <Text className="text-xs font-sans-medium text-red-500 ml-1">Remove coupon</Text>
          </Pressable>
        )}

        {/* Coupon Selection Bottom Sheet */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={dropdownOpen}
          onRequestClose={() => setDropdownOpen(false)}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <View style={[styles.drawerContainer, { maxHeight: height * 0.7 }]} className="bg-white px-5 pb-7 pt-4">
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-gray-900 text-xl font-sans-extrabold">Available Coupons</Text>
                <Pressable
                  onPress={() => setDropdownOpen(false)}
                  className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
                >
                  <Feather name="x" size={16} color="#64748b" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="gap-y-2.5 mt-2">
                  {availableCoupons.map((coupon) => (
                    <Pressable
                      key={coupon.id}
                      onPress={() => {
                        onSelectCoupon(selectedCoupon?.code === coupon.code ? null : coupon);
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-3.5 border rounded-xl ${
                        selectedCoupon?.code === coupon.code
                          ? 'border-primary bg-[#eef0ff]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 mr-3">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-sm font-sans-bold text-gray-900">{coupon.name}</Text>
                            <View className="bg-primary/10 rounded px-1.5 py-0.5">
                              <Text className="text-[10px] font-sans-bold text-primary">{coupon.code}</Text>
                            </View>
                          </View>
                          <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">
                            {coupon.discountType === 'percent' ? `${coupon.value}% off` : `Rs. ${coupon.value} off`}
                            {coupon.remaining_uses > 0 && ` (${coupon.remaining_uses} uses left)`}
                          </Text>
                        </View>
                        {selectedCoupon?.code === coupon.code && (
                          <View className="h-6 w-6 rounded-full bg-primary items-center justify-center mt-0.5">
                            <Feather name="check" size={12} color="#fff" />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>

      {/* Loyalty Points */}
      <View>
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-xs font-sans-bold text-gray-950 uppercase tracking-wide ml-0.5">
            Redeem Loyalty Points
          </Text>
          <Text className="text-xs font-sans-bold text-primary">Balance: {loyaltyBalance} pts</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Input
              placeholder="Enter points"
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 17, 31, 0.4)',
  },
  drawerContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
});

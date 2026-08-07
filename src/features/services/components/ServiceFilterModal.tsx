import React from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { SERVICE_LOCATIONS } from '@/types';

export interface ServiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  minRating: string;
  setMinRating: (val: string) => void;
  serviceLocation: string;
  setServiceLocation: (val: string) => void;
  radius?: string;
  setRadius?: (val: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ServiceFilterModal({
  isOpen,
  onClose,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  serviceLocation,
  setServiceLocation,
  radius = '25',
  setRadius,
  onApply,
  onReset,
}: ServiceFilterModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 gap-6 max-h-[85%]">
          <View className="flex-row justify-between items-center pb-2 border-b border-gray-100">
            <Text className="text-lg font-sans-bold text-gray-900">{t('services.filterTitle')}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              className="p-1"
            >
              <Feather name="x" size={20} color="#475569" accessible={false} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
            {/* Price Range */}
            <View className="gap-2">
              <Text className="text-sm font-sans-bold text-gray-800">{t('services.priceRange')}</Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  placeholder={t('services.minPrice')}
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50/50"
                />
                <Text className="text-gray-400 font-sans-medium">{t('services.to')}</Text>
                <TextInput
                  placeholder={t('services.maxPrice')}
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50/50"
                />
              </View>
            </View>

            {/* Search Radius */}
            <View className="gap-2">
              <Text className="text-sm font-sans-bold text-gray-800">Search Radius (km)</Text>
              <View className="flex-row flex-wrap gap-2">
                {['2', '5', '10', '25', '50', '100'].map((r) => {
                  const isSelected = (radius || '25') === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRadius && setRadius(r)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      className={`px-3.5 py-2 rounded-xl border items-center justify-center ${
                        isSelected ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-xs font-sans-bold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                        {r} km
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Minimum Rating */}
            <View className="gap-2">
              <Text className="text-sm font-sans-bold text-gray-800">{t('services.minimumRating')}</Text>
              <View className="flex-row gap-2">
                {['1', '2', '3', '4', '5'].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setMinRating(minRating === star ? '' : star)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: minRating === star }}
                    className={`flex-1 py-2.5 rounded-xl border items-center justify-center flex-row gap-1 ${
                      minRating === star ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-sans-semibold ${
                        minRating === star ? 'text-amber-700' : 'text-gray-600'
                      }`}
                    >
                      {star}
                    </Text>
                    <Feather
                      name="star"
                      size={11}
                      color={minRating === star ? '#eab308' : '#94a3b8'}
                      accessible={false}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Service Location */}
            <View className="gap-2">
              <Text className="text-sm font-sans-bold text-gray-800">{t('services.serviceLocationFilter')}</Text>
              <View className="gap-2">
                {[
                  { label: t('services.fixedStudio'), value: SERVICE_LOCATIONS.Fixed },
                  { label: t('services.atCustomerLocation'), value: SERVICE_LOCATIONS.Customer },
                  { label: t('services.remoteOnlineCall'), value: SERVICE_LOCATIONS.Remote },
                ].map((loc) => (
                  <Pressable
                    key={loc.value}
                    onPress={() => setServiceLocation(serviceLocation === loc.value ? '' : loc.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: serviceLocation === loc.value }}
                    className={`p-3 rounded-xl border flex-row justify-between items-center ${
                      serviceLocation === loc.value ? 'bg-blue-50/50 border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-sans-medium ${
                        serviceLocation === loc.value ? 'text-primary' : 'text-gray-700'
                      }`}
                    >
                      {loc.label}
                    </Text>
                    {serviceLocation === loc.value ? (
                      <Feather name="check" size={16} color="var(--primary)" accessible={false} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="flex-row items-center gap-3 pt-3 border-t border-gray-100">
            <Button title={t('services.reset')} variant="outline" onPress={onReset} className="flex-1" />
            <Button title={t('services.applyFilters')} variant="primary" onPress={onApply} className="flex-1" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

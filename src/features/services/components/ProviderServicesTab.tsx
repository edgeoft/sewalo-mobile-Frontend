import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { PackageDeal, ServiceItem } from '@/types';
import { THEME_COLORS } from '@/constants/colors';

interface ProviderServicesTabProps {
  specialPackage?: PackageDeal | null;
  individualServices: ServiceItem[];
  selectedServices: Record<string, boolean>;
  onServiceToggle: (serviceId: string) => void;
  onBookPackage: () => void;
  isOwnProfile?: boolean;
}

export default function ProviderServicesTab({
  specialPackage,
  individualServices,
  selectedServices,
  onServiceToggle,
  onBookPackage,
  isOwnProfile = false,
}: ProviderServicesTabProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-y-5">
      {isOwnProfile && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-row items-center gap-2">
          <Feather name="info" size={16} color={THEME_COLORS.primary} />
          <Text className="text-xs font-sans-medium text-blue-800 flex-1">
            You cannot book your own services. Switch to Provider mode to manage pricing and offerings.
          </Text>
        </View>
      )}
      {/* Special Package Deals (Conditional) */}
      {specialPackage && (
        <View className="gap-y-2">
          <View className="flex-row items-center gap-1.5">
            <Feather name="zap" size={16} color={THEME_COLORS.primary} />
            <Text className="text-sm font-sans-extrabold text-gray-950">{t('services.specialPackageDeals')}</Text>
          </View>

          <View className="bg-surface-indigo-subtle border border-blue-100 rounded-lg p-3">
            <Text className="text-base font-sans-extrabold text-gray-950 mb-1">{specialPackage.title}</Text>
            {!!specialPackage.description && (
              <Text className="text-xs font-sans-medium text-gray-500 leading-relaxed mb-2.5">
                {specialPackage.description}
              </Text>
            )}

            {/* Package Inclusions Card */}
            {specialPackage.inclusions && specialPackage.inclusions.length > 0 && (
              <View className="bg-white rounded-lg p-2.5 mb-2.5 border border-blue-50/50">
                <Text className="text-[10px] font-sans-bold text-primary uppercase tracking-wider mb-1.5">
                  {t('services.packageIncludes')}
                </Text>
                {specialPackage.inclusions.map((item, idx) => {
                  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item);
                  const displayItem = isUuid ? t('services.serviceOffering') : item;
                  return (
                    <View key={idx} className="flex-row items-center mb-1">
                      <View className="h-4 w-4 bg-surface-indigo-subtle rounded-full items-center justify-center mr-2">
                        <Feather name="check" size={10} color={THEME_COLORS.primary} />
                      </View>
                      <Text className="text-xs font-sans-medium text-gray-700">{displayItem}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View className="flex-row items-center justify-between mb-2.5">
              <View>
                <Text className="text-[9px] font-sans-semibold text-gray-400 uppercase">
                  {t('services.packagePrice')}
                </Text>
                <Text className="text-base font-sans-extrabold text-primary">{specialPackage.price}</Text>
              </View>

              <View className="flex-row items-center bg-blue-100/70 px-2.5 py-1 rounded-lg">
                <Feather name="clock" size={11} color={THEME_COLORS.primary} className="mr-1" />
                <Text className="text-[10px] font-sans-bold text-primary">{specialPackage.durationLabel}</Text>
              </View>
            </View>

            {!isOwnProfile && (
              <Button
                title={t('services.bookPackage')}
                variant="primary"
                onPress={onBookPackage}
                className="py-2.5 rounded-lg"
                leftIcon={<Feather name="calendar" size={16} color="white" />}
              />
            )}
          </View>
        </View>
      )}

      {/* Individual Services */}
      <View className="gap-y-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-sans-extrabold text-gray-950">{t('services.individualServices')}</Text>
          <View className="bg-gray-100 rounded-lg px-2 py-0.5">
            <Text className="text-[10px] font-sans-semibold text-gray-500">
              {t('services.servicesAvailable', { count: individualServices.length })}
            </Text>
          </View>
        </View>

        {individualServices.map((service) => {
          const isChecked = !isOwnProfile && !!selectedServices[service.id];
          return (
            <Pressable
              key={service.id}
              onPress={() => !isOwnProfile && onServiceToggle(service.id)}
              disabled={isOwnProfile}
              accessibilityRole="button"
              accessibilityState={{ checked: isChecked }}
              className={`bg-white border rounded-xl p-3.5 flex-row items-center justify-between ${
                isChecked ? 'border-primary bg-primary/[0.02]' : 'border-gray-200'
              }`}
            >
              <View className="flex-row items-center flex-1 pr-4">
                {!isOwnProfile && (
                  <Checkbox checked={isChecked} onChange={() => onServiceToggle(service.id)} className="mr-3" />
                )}
                <View className="flex-1">
                  <Text className="text-xs font-sans-bold text-gray-900 mb-1">{service.title}</Text>
                  <View className="flex-row items-center flex-wrap gap-2">
                    <View className="bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                      <Text className="text-[9px] font-sans-semibold text-gray-400">{service.category}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Feather name="clock" size={10} color={THEME_COLORS.slate400} className="mr-0.5" />
                      <Text className="text-[9px] font-sans-medium text-gray-400">{service.durationLabel}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text className="text-sm font-sans-extrabold text-primary">{service.price}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Pricing Info Card */}
      <View className="bg-amber-50/50 border border-amber-200 rounded-lg p-4">
        <View className="flex-row items-center gap-1.5 mb-2">
          <Feather name="info" size={14} color={THEME_COLORS.amberStar} />
          <Text className="text-xs font-sans-bold text-amber-800">{t('services.pricingInfo')}</Text>
        </View>
        {[
          t('services.pricingBullet1'),
          t('services.pricingBullet2'),
          t('services.pricingBullet3'),
          t('services.pricingBullet4'),
          t('services.pricingBullet5'),
        ].map((bullet, idx) => (
          <View key={idx} className="flex-row items-start mb-1.5">
            <Text className="text-[8px] text-amber-600 mr-2 mt-1">•</Text>
            <Text className="flex-1 text-[11px] font-sans-medium text-amber-700/80 leading-4">{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

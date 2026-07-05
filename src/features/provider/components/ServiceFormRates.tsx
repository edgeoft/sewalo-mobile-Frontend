import React, { useEffect, useState } from 'react';
import { Control, FieldError, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Input from '@/components/ui/Input';
import { SERVICE_TYPES, SERVICE_CATEGORIES } from '../constants/serviceOptions';
import { ServiceFormData } from '@/types';
import { useGetProviderCategoriesQuery, useGetProviderSubCategoriesQuery } from '@/api';
import RateCard, { BillingBasisType, DurationUnitType } from './RateCard';
import BillingBasisGuideModal from './BillingBasisGuideModal';

interface ServiceFormRatesProps {
  control: Control<ServiceFormData>;
  errors: FieldErrors<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  watchServiceTypeIds: string[];
  watchRates: ServiceFormData['rates'];
  watchPackages?: ServiceFormData['packages'];
  watchCategoryId: string;
}

export default function ServiceFormRates({
  control,
  errors,
  setValue,
  watchServiceTypeIds,
  watchRates = {},
  watchPackages = [],
  watchCategoryId,
}: ServiceFormRatesProps) {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgErrors, setPkgErrors] = useState<{ title?: string; price?: string; description?: string }>({});

  // Ensure that each selected service type has a rate structure initialized
  useEffect(() => {
    const currentRates = { ...watchRates };
    let hasChanges = false;

    watchServiceTypeIds.forEach((id) => {
      if (!currentRates[id]) {
        currentRates[id] = {
          price: '',
          billingBasis: 'per_hour',
          duration: '',
          durationUnit: 'hours',
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setValue('rates', currentRates);
    }
  }, [watchServiceTypeIds, watchRates, setValue]);

  const handlePriceChange = (id: string, value: string) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      price: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleBasisChange = (id: string, value: BillingBasisType) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      billingBasis: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleDurationChange = (id: string, value: string) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      duration: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleUnitChange = (id: string, value: DurationUnitType) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      durationUnit: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleAddPackage = () => {
    const newErrors: { title?: string; price?: string; description?: string } = {};
    if (!pkgTitle.trim() || pkgTitle.trim().length < 3) {
      newErrors.title = 'Package title must be at least 3 characters';
    }
    const priceNum = Number(pkgPrice);
    if (!pkgPrice.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!pkgDescription.trim() || pkgDescription.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setPkgErrors(newErrors);
      return;
    }

    const newPkg = {
      id: `pkg-${Date.now()}`,
      title: pkgTitle.trim(),
      description: pkgDescription.trim(),
      price: pkgPrice.trim(),
    };

    setValue('packages', [...(watchPackages || []), newPkg], { shouldValidate: true });

    // Reset inline form state
    setPkgTitle('');
    setPkgPrice('');
    setPkgDescription('');
    setPkgErrors({});
    setShowPkgForm(false);
  };

  const handleRemovePackage = (index: number) => {
    const updated = (watchPackages || []).filter((_, i) => i !== index);
    setValue('packages', updated, { shouldValidate: true });
  };

  const handleCancelCreate = () => {
    setPkgTitle('');
    setPkgPrice('');
    setPkgDescription('');
    setPkgErrors({});
    setShowPkgForm(false);
  };

  // Fetch categories and subcategories dynamically from the API to display rate card names
  const { data: categoriesData } = useGetProviderCategoriesQuery();
  const categoriesList =
    categoriesData?.data && categoriesData.data.length > 0 ? categoriesData.data : SERVICE_CATEGORIES;
  const activeCategory = categoriesList.find((cat) => cat.id === watchCategoryId);
  const activeCategorySlug = (activeCategory && 'slug' in activeCategory ? activeCategory.slug : '') as string;

  const { data: subcategoriesData } = useGetProviderSubCategoriesQuery(activeCategorySlug, !!activeCategorySlug);

  const availableServiceTypes = activeCategory
    ? subcategoriesData?.data && subcategoriesData.data.length > 0
      ? subcategoriesData.data.map((sub) => ({ id: sub.id, name: sub.name, categoryId: sub.category_id }))
      : SERVICE_TYPES.filter((t) => t.categoryId === watchCategoryId)
    : [];

  return (
    <View
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 0,
      }}
      className="rounded-xl border border-gray-200 bg-white p-3.5 mb-6"
    >
      {/* Header Inside Card */}
      <View className="mb-4">
        <Text className="text-base font-sans-bold text-gray-950 mb-1">Your Services & Rates</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          List the specific tasks you perform and how much you charge for them. Refer to the{' '}
          <Text onPress={() => setShowGuideModal(true)} className="text-primary underline font-sans-semibold">
            guideline
          </Text>
        </Text>
      </View>

      {watchServiceTypeIds.length === 0 ? (
        <View className="items-center justify-center py-6 border-t border-gray-100 mt-2">
          <Text className="text-xs font-sans-medium text-gray-400 text-center">
            Please select at least one service type in Section 1 to configure rates.
          </Text>
        </View>
      ) : (
        <View className="gap-y-4">
          {watchServiceTypeIds.map((id, index) => {
            const typeInfo = availableServiceTypes.find((t) => t.id === id);
            if (!typeInfo) return null;

            const rate = watchRates[id] || {
              price: '',
              billingBasis: 'per_hour',
              duration: '',
              durationUnit: 'hours',
            };

            const rateErrors = errors.rates?.[id] as
              | { price?: FieldError; billingBasis?: FieldError; duration?: FieldError; durationUnit?: FieldError }
              | undefined;

            return (
              <View
                key={id}
                className={index > 0 ? 'border-t border-gray-100 pt-4 mt-2' : 'border-t border-gray-100 pt-2'}
              >
                <RateCard
                  serviceTypeName={typeInfo.name}
                  priceValue={rate.price}
                  onPriceChange={(val) => handlePriceChange(id, val)}
                  priceError={rateErrors?.price?.message}
                  billingBasisValue={rate.billingBasis}
                  onBillingBasisChange={(val) => handleBasisChange(id, val)}
                  billingBasisError={rateErrors?.billingBasis?.message}
                  durationValue={rate.duration}
                  onDurationChange={(val) => handleDurationChange(id, val)}
                  durationError={rateErrors?.duration?.message}
                  durationUnitValue={rate.durationUnit}
                  onDurationUnitChange={(val) => handleUnitChange(id, val)}
                />
              </View>
            );
          })}

          {/* Packages Section */}
          <View className="border-t border-gray-100 pt-4 mt-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              Package <Text className="text-gray-400 font-sans-medium">(Optional)</Text>
            </Text>

            {watchPackages.length > 0 && (
              <View className="gap-y-3 mb-2">
                {watchPackages.map((pkg, idx) => (
                  <View key={pkg.id || idx} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 relative">
                    <View className="pr-8">
                      <Text className="text-xs font-sans-bold text-gray-900 mb-1">{pkg.title}</Text>
                      <Text className="text-[10px] font-sans-medium text-gray-500 mb-2 leading-normal">
                        {pkg.description}
                      </Text>
                      <Text className="text-xs font-sans-bold text-primary">Rs. {pkg.price}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleRemovePackage(idx)}
                      className="absolute top-3.5 right-3.5 h-6 w-6 rounded-full bg-red-50/80 border border-red-100/50 items-center justify-center active:bg-red-100"
                    >
                      <Feather name="trash-2" size={12} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {showPkgForm ? (
              <View className="border border-indigo-50 bg-indigo-50/10 rounded-xl p-3.5 mt-2">
                <Text className="text-xs font-sans-bold text-gray-900 mb-3">Create a Package</Text>

                <View className="gap-y-3">
                  <Input
                    label="Package Title"
                    placeholder="e.g. Standard Home Makeover"
                    value={pkgTitle}
                    onChangeText={setPkgTitle}
                    error={pkgErrors.title}
                  />

                  <Input
                    label="Price"
                    placeholder="e.g. 4500"
                    keyboardType="numeric"
                    value={pkgPrice}
                    onChangeText={setPkgPrice}
                    error={pkgErrors.price}
                    leftIcon={<Text className="text-xs font-sans-bold text-gray-500">Rs.</Text>}
                  />

                  <Input
                    label="Description"
                    placeholder="Describe what is included in this package..."
                    multiline
                    numberOfLines={3}
                    value={pkgDescription}
                    onChangeText={setPkgDescription}
                    error={pkgErrors.description}
                  />
                </View>

                <View className="flex-row justify-end gap-x-2 mt-4">
                  <Pressable
                    onPress={handleCancelCreate}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white active:bg-gray-50"
                  >
                    <Text className="text-xs font-sans-semibold text-gray-600">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleAddPackage} className="px-4 py-2 rounded-lg bg-primary active:opacity-90">
                    <Text className="text-xs font-sans-semibold text-white">Add Package</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowPkgForm(true)}
                className="py-3 border border-dashed border-gray-300 rounded-lg bg-gray-50/50 flex-row items-center justify-center active:bg-gray-100"
              >
                <Feather name="plus" size={12} color="#485aff" className="mr-1.5" />
                <Text className="text-xs font-sans-semibold text-primary">Create a Package</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
      <BillingBasisGuideModal visible={showGuideModal} onClose={() => setShowGuideModal(false)} />
    </View>
  );
}

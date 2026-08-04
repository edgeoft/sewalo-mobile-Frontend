import React, { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import Input from '@/components/ui/Input';
import SelectionOption from '@/components/ui/SelectionOption';
import { SERVICE_CATEGORIES, getServiceTypesByCategory } from '../constants/serviceOptions';
import { useGetProviderCategoriesQuery, useGetProviderSubCategoriesQuery } from '@/api';
import { ServiceFormData } from '@/types';
import { THEME_COLORS } from '@/constants/colors';

interface ServiceFormBasicsProps {
  control: Control<ServiceFormData>;
  errors: FieldErrors<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  getValues: UseFormGetValues<ServiceFormData>;
  watchCategoryId: string;
  watchServiceTypeIds: string[];
}

export default function ServiceFormBasics({
  control,
  errors,
  setValue,
  getValues,
  watchCategoryId,
  watchServiceTypeIds,
}: ServiceFormBasicsProps) {
  const { height } = useWindowDimensions();
  const [catModalVisible, setCatModalVisible] = useState(false);

  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Fetch categories and subcategories dynamically from the API
  const { data: categoriesData } = useGetProviderCategoriesQuery();
  const categoriesList =
    categoriesData?.data && categoriesData.data.length > 0 ? categoriesData.data : SERVICE_CATEGORIES;

  // Get active category details
  const activeCategory = categoriesList.find((cat) => cat.id === watchCategoryId);
  const activeCategorySlug = (activeCategory && 'slug' in activeCategory ? activeCategory.slug : '') as string;

  const { data: subcategoriesData } = useGetProviderSubCategoriesQuery(activeCategorySlug || '', !!activeCategorySlug);

  const availableServiceTypes = activeCategory
    ? subcategoriesData?.data && subcategoriesData.data.length > 0
      ? subcategoriesData.data.map((sub) => ({ id: sub.id, name: sub.name, categoryId: sub.category_id }))
      : getServiceTypesByCategory(watchCategoryId)
    : [];

  const handleCategorySelect = (categoryId: string) => {
    setValue('categoryId', categoryId, { shouldValidate: true });
    // Reset service types and rates when category changes
    setValue('serviceTypeIds', [], { shouldValidate: true });
    setValue('rates', {}, { shouldValidate: true });
    setCatModalVisible(false);
  };

  const handleServiceTypeToggle = (typeId: string) => {
    const currentSelected = [...watchServiceTypeIds];
    const index = currentSelected.indexOf(typeId);

    if (index > -1) {
      currentSelected.splice(index, 1);
      // Remove corresponding rate card entry
      const currentRates = getValues('rates');
      const rates = { ...currentRates };
      delete rates[typeId];
      setValue('rates', rates, { shouldValidate: true });
    } else {
      currentSelected.push(typeId);
    }

    setValue('serviceTypeIds', currentSelected, { shouldValidate: true });
  };

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
      <View className="mb-4">
        <Text className="text-base font-sans-bold text-gray-950 mb-1">Service Basics</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          Define the primary category, title, and detailed description of the services you offer.
        </Text>
      </View>

      <View className="gap-y-4">
        {/* Service Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Service Title *"
              placeholder="e.g. Premium Deep Cleaning & Sanitization"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              inputStyle={{ padding: 0 }}
              error={errors.title?.message}
            />
          )}
        />

        {/* Category Picker Dropdown */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">Category *</Text>
          <Pressable
            onPress={() => setCatModalVisible(true)}
            accessibilityRole="button"
            className={`form-input-container form-input-container-single justify-between ${
              errors.categoryId ? 'border-destructive' : 'border-gray-200'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 2,
              elevation: 0,
              paddingHorizontal: 14,
            }}
          >
            <Text className={`text-sm flex-1 ${activeCategory ? 'text-gray-900' : 'text-form-field-placeholder'}`}>
              {activeCategory ? activeCategory.name : 'Select a Category'}
            </Text>
            <Feather name="chevron-down" size={16} color={THEME_COLORS.slate400} accessible={false} />
          </Pressable>
          {errors.categoryId && (
            <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{errors.categoryId.message}</Text>
          )}
        </View>

        {/* Service Types Offered (Dropdown Picker) */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">Service Types Offered *</Text>
          {watchCategoryId ? (
            <Pressable
              onPress={() => setTypeModalVisible(true)}
              accessibilityRole="button"
              className={`form-input-container form-input-container-single justify-between ${
                errors.serviceTypeIds ? 'border-destructive' : 'border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.015,
                shadowRadius: 2,
                elevation: 0,
                paddingHorizontal: 14,
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={`text-sm flex-1 ${watchServiceTypeIds.length > 0 ? 'text-gray-900' : 'text-form-field-placeholder'}`}
              >
                {watchServiceTypeIds.length > 0
                  ? (() => {
                      const names = watchServiceTypeIds
                        .map((id) => availableServiceTypes.find((t) => t.id === id)?.name)
                        .filter(Boolean);
                      if (names.length === 0) return 'Select Service Types';
                      if (names.length === 1) return names[0];
                      return `${names[0]} +${names.length - 1} more`;
                    })()
                  : 'Select Service Types'}
              </Text>
              <Feather name="chevron-down" size={16} color={THEME_COLORS.slate400} accessible={false} />
            </Pressable>
          ) : (
            <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <Text className="text-xs font-sans-medium text-form-field-placeholder">
                Please select a category first to see available service types.
              </Text>
            </View>
          )}
          {errors.serviceTypeIds && (
            <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">
              {errors.serviceTypeIds.message}
            </Text>
          )}
        </View>

        {/* Describe Your Service Textarea */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Input
                label="Describe Your Service *"
                placeholder="Describe your services in detail (minimum 20 characters). Mention what is included, your work process, and materials used."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline={true}
                numberOfLines={4}
                inputStyle={{ height: 110, textAlignVertical: 'top', padding: 0 }}
                error={errors.description?.message}
              />
              <Text className="text-right text-[10px] font-sans-semibold text-gray-400 mt-1">
                {(value || '').length} characters (min 20)
              </Text>
            </View>
          )}
        />
      </View>

      {/* Category Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={catModalVisible}
        onRequestClose={() => setCatModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setCatModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.55 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">Service Category</Text>
              <Pressable
                onPress={() => setCatModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">Choose a primary service category</Text>

            <View className="gap-y-2.5">
              {categoriesList.map((cat) => {
                const isSelected = cat.id === watchCategoryId;
                return (
                  <SelectionOption
                    key={cat.id}
                    onPress={() => handleCategorySelect(cat.id)}
                    title={cat.name}
                    selected={isSelected}
                    indicatorType="radio"
                    gradientColors={['#eef0ff', '#f8fafc']}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Service Types Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={typeModalVisible}
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setTypeModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.65 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">Service Types</Text>
              <Pressable
                onPress={() => setTypeModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">Choose services you offer</Text>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[70%] mb-4">
              <View className="gap-y-2.5 pb-4">
                {availableServiceTypes.map((type) => {
                  const isSelected = watchServiceTypeIds.includes(type.id);
                  return (
                    <SelectionOption
                      key={type.id}
                      onPress={() => handleServiceTypeToggle(type.id)}
                      title={type.name}
                      selected={isSelected}
                      indicatorType="checkbox"
                      gradientColors={['#eef0ff', '#f8fafc']}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

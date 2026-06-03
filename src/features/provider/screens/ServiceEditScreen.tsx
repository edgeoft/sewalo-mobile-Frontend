import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { serviceFormSchema, ServiceFormData } from '../data/serviceSchemas';

// Import subcomponents
import ServiceFormBasics from '../components/ServiceFormBasics';
import ServiceFormRates from '../components/ServiceFormRates';
import ServiceFormDelivery from '../components/ServiceFormDelivery';
import ServiceFormStandout from '../components/ServiceFormStandout';
import ServiceStickyFooter from '../components/ServiceStickyFooter';

const defaultValues: ServiceFormData = {
  title: '',
  categoryId: '',
  serviceTypeIds: [],
  description: '',
  rates: {},
  deliveryTypes: ['at_customer'],
  workSamples: [],
  hashtags: [],
  portfolioUrl: '',
  packages: [],
};

// Map of mock service data for edit mode
const mockEditData: ServiceFormData = {
  title: 'Premium Home Sanitization & Deep Cleaning',
  categoryId: 'cleaning',
  serviceTypeIds: ['sub-1', 'sub-2', 'sub-3', 'sub-4'],
  description:
    'We provide professional deep cleaning services using eco-friendly materials. Our team of certified professionals ensures a 100% dust-free and sanitized environment for your homes and offices.',
  rates: {
    'sub-1': { price: '1200', billingBasis: 'per_hour', duration: '2', durationUnit: 'hours' },
    'sub-2': { price: '1800', billingBasis: 'per_job', duration: '3', durationUnit: 'hours' },
    'sub-3': { price: '1500', billingBasis: 'per_job', duration: '1.5', durationUnit: 'hours' },
    'sub-4': { price: '2000', billingBasis: 'per_job', duration: '4', durationUnit: 'hours' },
  },
  deliveryTypes: ['at_customer'],
  workSamples: [
    {
      uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop',
      uploaded: true,
    },
    {
      uri: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop',
      uploaded: true,
    },
    {
      uri: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=400&auto=format&fit=crop',
      uploaded: true,
    },
    {
      uri: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=400&auto=format&fit=crop',
      uploaded: true,
    },
  ],
  hashtags: ['DeepCleaning', 'Sanitization', 'KathmanduServices', 'EcoFriendly', 'CleanHome'],
  portfolioUrl: 'https://www.cleansewalo.com',
  packages: [
    {
      id: 'pkg-1',
      title: 'Standard Home Makeover',
      description:
        'Includes full kitchen sanitization, bathroom deep cleaning, and sofa shampooing with a 2-day warranty.',
      price: '4500',
    },
    {
      id: 'pkg-2',
      title: 'Express Dusting & Sanitization',
      description: 'Includes full living room and kitchen sanitization, vacuuming, and trash disposal.',
      price: '2200',
    },
  ],
};

export default function ServiceEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: 'add' | 'edit' }>();

  const isEditMode = mode === 'edit';
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema) as any,
    defaultValues: isEditMode ? mockEditData : defaultValues,
    mode: 'onBlur',
  });

  // Watch form fields for reactive UI updates
  const watchCategoryId = watch('categoryId');
  const watchServiceTypeIds = watch('serviceTypeIds') || [];
  const watchRates = watch('rates') || {};
  const watchDeliveryTypes = watch('deliveryTypes') || [];
  const watchWorkSamples = watch('workSamples') || [];
  const watchHashtags = watch('hashtags') || [];
  const watchPackages = watch('packages') || [];

  const onSubmit = (data: ServiceFormData) => {
    setLoading(true);
    setSaveSuccess(false);

    // Mock API saving call
    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);

      Alert.alert('Success', isEditMode ? 'Service updated successfully!' : 'Service created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    }, 1500);
  };

  const hasFormErrors = Object.keys(errors).length > 0;

  return (
    <View className="flex-1 bg-secondary">
      {/* Back navigation header */}
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom + 100, 120), // spacing for the sticky footer
        }}
      >
        <SectionHeader
          title={isEditMode ? 'Edit Service' : 'Create a Service'}
          description={
            isEditMode
              ? 'Update your service catalog rates, delivery preferences, and work details.'
              : 'Add a new service offering to your catalog to start getting booked.'
          }
          className="mb-6"
          titleClassName="text-2xl"
        />

        <ServiceFormBasics
          control={control}
          errors={errors}
          setValue={setValue}
          watchCategoryId={watchCategoryId}
          watchServiceTypeIds={watchServiceTypeIds}
        />

        <ServiceFormRates
          control={control}
          errors={errors}
          setValue={setValue}
          watchServiceTypeIds={watchServiceTypeIds}
          watchRates={watchRates}
          watchPackages={watchPackages}
        />

        <ServiceFormDelivery
          control={control}
          errors={errors}
          setValue={setValue}
          watchDeliveryTypes={watchDeliveryTypes}
        />

        <ServiceFormStandout
          control={control}
          errors={errors}
          setValue={setValue}
          watchWorkSamples={watchWorkSamples}
          watchHashtags={watchHashtags}
        />
      </ContentLayout>

      {/* Sticky footer saving orchestrator */}
      <ServiceStickyFooter
        onSave={handleSubmit(onSubmit)}
        disabled={loading}
        loading={loading}
        infoMessage={saveSuccess ? 'All changes saved.' : undefined}
      />
    </View>
  );
}

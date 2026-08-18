import React, { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter, Href } from 'expo-router';
import { useForm, Resolver, useWatch } from 'react-hook-form';
import { View, ActivityIndicator } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { serviceFormSchema } from '@/schemas/service';
import { ServiceFormData, DELIVERY_TYPES, SERVICE_LOCATIONS, DeliveryType } from '@/types';
import { useCreateServiceMutation, useGetMyServicesQuery, useUpdateServiceMutation, useUploadFile } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';
import { ROUTES } from '@/constants/routes';
import { getImageUrl } from '@/utils/image';

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
  deliveryTypes: [DELIVERY_TYPES.Customer],
  workSamples: [],
  hashtags: [],
  portfolioUrl: '',
  packages: [],
};

export default function ServiceEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { mode } = useLocalSearchParams<{ mode?: 'add' | 'edit' }>();

  const isEditMode = mode === 'edit';
  const { mutate: createService, isPending, isSuccess } = useCreateServiceMutation();
  const { mutate: updateService, isPending: isUpdating, isSuccess: isUpdateSuccess } = useUpdateServiceMutation();
  const { showSnackbar } = useSnackbar();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { data: myServiceData, isLoading: isServiceLoading } = useGetMyServicesQuery({ enabled: isEditMode });
  const service = myServiceData?.data;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormData>,
    defaultValues: defaultValues,
    mode: 'onBlur',
  });

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isEditMode && service && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const unitMap: Record<string, 'minutes' | 'hours' | 'days' | 'weeks'> = {
        hour: 'hours',
        day: 'days',
        week: 'weeks',
        minute: 'minutes',
      };

      const parsedRates: Record<string, any> = {};
      service.service_offerings?.forEach((offering) => {
        parsedRates[offering.sub_category_id] = {
          price: offering.price ? offering.price.toString() : '',
          billingBasis: 'per_hour',
          duration: offering.duration ? offering.duration.toString() : '1',
          durationUnit: unitMap[offering.duration_unit] || 'hours',
        };
      });

      const locationReverseMap: Record<string, DeliveryType> = {
        [SERVICE_LOCATIONS.Fixed]: DELIVERY_TYPES.Fixed,
        [SERVICE_LOCATIONS.Remote]: DELIVERY_TYPES.Remote,
        [SERVICE_LOCATIONS.Customer]: DELIVERY_TYPES.Customer,
      };
      const deliveryTypes = service.service_location?.map((loc) => locationReverseMap[loc]).filter(Boolean) || [];

      reset(
        {
          title: service.name || '',
          categoryId: service.category_id || '',
          serviceTypeIds: service.service_offerings?.map((offering) => offering.sub_category_id) || [],
          description: service.description || '',
          rates: parsedRates,
          deliveryTypes: deliveryTypes.length > 0 ? deliveryTypes : [DELIVERY_TYPES.Customer],
          workSamples: (service.portfolio || []).map((p) => ({
            uri: getImageUrl(p) || '',
            uploaded: true,
          })),
          hashtags: service.tags || [],
          portfolioUrl: service.portfolio_url || '',
          packages:
            service.service_packages?.map((pkg) => ({
              id: pkg.id,
              title: pkg.name,
              description: pkg.description || '',
              price: pkg.price ? pkg.price.toString() : '',
            })) || [],
        },
        { keepDirtyValues: true },
      );
    }
  }, [isEditMode, service, reset]);

  // Watch form fields for reactive UI updates
  const watchCategoryId = useWatch({ control, name: 'categoryId' });
  const watchServiceTypeIds = useWatch({ control, name: 'serviceTypeIds' }) || [];
  const watchRates = useWatch({ control, name: 'rates' }) || {};
  const watchDeliveryTypes = useWatch({ control, name: 'deliveryTypes' }) || [];
  const watchWorkSamples = useWatch({ control, name: 'workSamples' }) || [];
  const watchHashtags = useWatch({ control, name: 'hashtags' }) || [];
  const watchPackages = useWatch({ control, name: 'packages' }) || [];

  if (isEditMode && isServiceLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  const onSubmit = async (data: ServiceFormData) => {
    // 1. Upload work samples
    const portfolioPaths: string[] = [];
    for (const sample of data.workSamples) {
      const res = await uploadFile({ uri: sample.uri, folder: 'document' });
      portfolioPaths.push(res.path);
    }

    // 2. Prepare payload matching CreateServiceParams
    const durationUnitMap: Record<string, string> = {
      hours: 'hour',
      days: 'day',
      weeks: 'week',
      minutes: 'hour', // fallback
    };

    const serviceOfferings = data.serviceTypeIds.map((typeId) => {
      const rate = data.rates[typeId];
      return {
        sub_category_id: typeId,
        price: Number(rate?.price) || 0,
        duration: Number(rate?.duration) || 0,
        duration_unit: durationUnitMap[rate?.durationUnit || ''] || 'hour',
        services_offered: [typeId],
      };
    });

    const servicePackages = (data.packages || []).map((pkg) => ({
      name: pkg.title,
      services_offered: data.serviceTypeIds,
      price: Number(pkg.price) || 0,
      duration: 1,
      duration_unit: 'hour',
    }));

    const serviceLocationMap: Record<DeliveryType, string> = {
      [DELIVERY_TYPES.Fixed]: SERVICE_LOCATIONS.Fixed,
      [DELIVERY_TYPES.Remote]: SERVICE_LOCATIONS.Remote,
      [DELIVERY_TYPES.Customer]: SERVICE_LOCATIONS.Customer,
    };
    const serviceLocation = data.deliveryTypes.map((t) => serviceLocationMap[t] || t);

    const payload = {
      name: data.title,
      category_id: data.categoryId,
      service_location: serviceLocation,
      description: data.description,
      tags: data.hashtags,
      portfolio: portfolioPaths,
      portfolio_url: data.portfolioUrl,
      has_service_packages: servicePackages.length > 0,
      service_offerings: serviceOfferings,
      service_packages: servicePackages,
    };

    if (isEditMode && service?.id) {
      updateService(
        { ...payload, id: service.id },
        {
          onSuccess: () => {
            showSnackbar({ message: t('provider.serviceUpdated'), type: 'success' });
          },
        },
      );
    } else {
      createService(payload, {
        onSuccess: () => {
          showSnackbar({ message: t('provider.serviceCreatedSuccess'), type: 'success' });
          router.replace(ROUTES.provider.serviceCreated as Href);
        },
      });
    }
  };

  const loading = isPending || isUpdating;
  const success = isSuccess || isUpdateSuccess;

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
          title={isEditMode ? t('provider.editService') : t('provider.createService')}
          description={isEditMode ? t('provider.editServiceDesc') : t('provider.createServiceDesc')}
          className="mb-6"
          titleClassName="text-2xl"
        />

        <ServiceFormBasics
          control={control}
          errors={errors}
          setValue={setValue}
          getValues={getValues}
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
          watchCategoryId={watchCategoryId}
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
        infoMessage={success ? t('provider.allChangesSaved') : undefined}
      />
    </View>
  );
}

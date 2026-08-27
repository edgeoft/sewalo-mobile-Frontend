import React, { useEffect, useRef, useState } from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import BasicInfoSection, { BasicInfoFormData } from '../components/BasicInfoSection';
import ServiceStickyFooter from '@/features/provider/components/ServiceStickyFooter';

import { useAuth } from '@/providers/AuthProvider';
import { getImageUrl } from '@/utils/image';
import { formatPhone, unformatPhone } from '../../auth/utils/phone';
import { useUpdateProfile, useUploadFile } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';
import type { UpdateProfilePayload } from '@/types';

export default function CustomerEditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { section } = useLocalSearchParams<{ section?: string }>();

  const scrollRef = useRef<ScrollView>(null);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, number>>({});

  const { showSnackbar } = useSnackbar();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  const handleSectionLayout = (key: string, y: number) => {
    setSectionLayouts((prev) => ({ ...prev, [key]: y }));
  };

  useEffect(() => {
    if (!section) return;

    let targetKey = section;
    if (section === 'avatar' || section === 'contact' || section === 'address') {
      targetKey = 'basic';
    } else if (section === 'document') {
      targetKey = 'identity';
    }

    const targetY = sectionLayouts[targetKey];
    if (targetY !== undefined) {
      const timeout = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, targetY - 12), animated: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [section, sectionLayouts]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      location: '',
      lat: undefined,
      lng: undefined,
      city: '',
      state: '',
      country: '',
      dateOfBirth: '',
      languages: [],
      bio: '',
      avatar: null,
    },
    // Hydrate reactively once the profile loads (fixes empty-form race on deep links).
    values: {
      fullName: user?.name || '',
      email: user?.email || '',
      mobileNumber: unformatPhone(user?.phone) || '',
      location: user?.address || '',
      lat: user?.coordinates?.lat || 27.700769,
      lng: user?.coordinates?.lng || 85.30014,
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || '',
      dateOfBirth: user?.dob || '',
      languages: user?.language || [],
      bio: user?.description || '',
      avatar: getImageUrl(user?.avatar) || null,
    },
    mode: 'onBlur',
  });

  const watchLanguages = useWatch({ control, name: 'languages' }) || [];
  const watchDateOfBirth = useWatch({ control, name: 'dateOfBirth' }) || '';
  const watchAvatar = useWatch({ control, name: 'avatar' }) || null;

  const handleSaveProfile = (data: BasicInfoFormData) => {
    const saveProfileData = (avatarPath: string | null) => {
      const payload: UpdateProfilePayload = {
        name: data.fullName,
        email: data.email?.trim() || undefined,
        phone: user?.phone || formatPhone(data.mobileNumber),
        address: data.location,
        city: data.city,
        state: data.state,
        country: data.country,
        dob: data.dateOfBirth,
        language: data.languages,
        description: data.bio,
      };
      if (data.lat !== undefined && data.lng !== undefined) {
        payload.coordinates = {
          lat: Number(data.lat),
          lng: Number(data.lng),
        };
      }
      if (avatarPath) {
        payload.avatar = avatarPath;
      }
      updateProfile(payload, {
        onSuccess: () => {
          showSnackbar({ message: t('customer.profileUpdated'), type: 'success' });
        },
      });
    };

    if (data.avatar && data.avatar !== getImageUrl(user?.avatar)) {
      uploadFile(
        { uri: data.avatar, folder: 'profile' },
        {
          onSuccess: (uploadRes) => {
            saveProfileData(uploadRes.path);
          },
        },
      );
    } else {
      saveProfileData(user?.avatar || null);
    }
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      ) : (
        <>
          <ContentLayout
            scrollable
            scrollRef={scrollRef}
            className="flex-1"
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom + 80, 100),
            }}
          >
            <SectionHeader
              title={t('customer.editProfileTitle')}
              description={t('customer.editProfileDesc')}
              className="mb-6"
              titleClassName="text-2xl text-gray-950 font-sans-extrabold"
            />

            <View onLayout={(e) => handleSectionLayout('basic', e.nativeEvent.layout.y)}>
              <BasicInfoSection
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                watchLanguages={watchLanguages}
                watchDateOfBirth={watchDateOfBirth}
                watchAvatar={watchAvatar}
              />
            </View>
          </ContentLayout>

          <ServiceStickyFooter
            title={t('common.save')}
            onSave={handleSubmit(handleSaveProfile)}
            loading={isUpdating || isUploading}
            disabled={isUpdating || isUploading}
          />
        </>
      )}
    </View>
  );
}

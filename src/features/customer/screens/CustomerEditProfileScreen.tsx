import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import BasicInfoSection, { BasicInfoFormData } from '../components/BasicInfoSection';

import { useAuth } from '@/providers/AuthProvider';
import { getImageUrl } from '../../auth/utils/image';
import { useUpdateProfile, useUploadFile } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';

export default function CustomerEditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  const locationStr = [user?.address, user?.city, user?.state, user?.country].filter(Boolean).join(', ');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    defaultValues: {
      fullName: user?.name || '',
      mobileNumber: user?.phone || '',
      location: locationStr,
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
      const payload: any = {
        name: data.fullName,
        phone: data.mobileNumber,
        address: data.location,
        dob: data.dateOfBirth,
        language: data.languages,
        description: data.bio,
      };
      if (avatarPath) {
        payload.avatar = avatarPath;
      }
      updateProfile(payload, {
        onSuccess: () => {
          showSnackbar({ message: t('customer.profileUpdated'), type: 'success' });
          router.back();
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
          <ActivityIndicator size="large" color="#485aff" />
        </View>
      ) : (
        <ContentLayout
          scrollable
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
          <SectionHeader
            title={t('customer.editProfileTitle')}
            description={t('customer.editProfileDesc')}
            className="mb-6"
            titleClassName="text-2xl text-gray-950 font-sans-extrabold"
          />

          <BasicInfoSection
            control={control}
            errors={errors}
            setValue={setValue}
            watchLanguages={watchLanguages}
            watchDateOfBirth={watchDateOfBirth}
            watchAvatar={watchAvatar}
            onSave={handleSubmit(handleSaveProfile)}
            loading={isUpdating || isUploading}
          />
        </ContentLayout>
      )}
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';

import { useSnackbar } from '@/components/ui/Snackbar';
import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

import BasicInfoSection, { BasicInfoFormData } from '@/features/customer/components/BasicInfoSection';
import SkillsExperienceSection, { EducationItem, ExperienceItem } from '../components/SkillsExperienceSection';
import AvailabilitySection from '../components/AvailabilitySection';

import { useAuth } from '@/providers/AuthProvider';
import { getImageUrl } from '../../auth/utils/image';
import { useUpdateProfile, useUploadFile } from '@/api';
import { Availability } from '@/types';
import { AVAILABILITY_TYPES, DEFAULT_WORKING_HOURS_END } from '@/constants/availability';

export default function ProviderEditProfileScreen() {
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

    // Map section search param to section layout keys
    let targetKey = section;
    if (section === 'avatar' || section === 'contact' || section === 'address') {
      targetKey = 'basic';
    } else if (section === 'education' || section === 'experience') {
      targetKey = 'skills';
    } else if (section === 'document') {
      targetKey = 'identity';
    }

    const targetY = sectionLayouts[targetKey];
    if (targetY !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, targetY - 12), animated: true });
      }, 100);
    }
  }, [section, sectionLayouts]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BasicInfoFormData>({
    defaultValues: {
      fullName: user?.name || '',
      mobileNumber: user?.phone || '',
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

  React.useEffect(() => {
    if (user) {
      reset({
        fullName: user.name || '',
        mobileNumber: user.phone || '',
        location: user.address || '',
        lat: user.coordinates?.lat || 27.700769,
        lng: user.coordinates?.lng || 85.30014,
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        dateOfBirth: user.dob || '',
        languages: user.language || [],
        bio: user.description || '',
        avatar: getImageUrl(user.avatar) || null,
      });
    }
  }, [user, reset]);

  const watchLanguages = useWatch({ control, name: 'languages' }) || [];
  const watchDateOfBirth = useWatch({ control, name: 'dateOfBirth' }) || '';
  const watchAvatar = useWatch({ control, name: 'avatar' }) || '';

  const handleSaveBasicInfo = (data: BasicInfoFormData) => {
    const saveProfileData = (avatarPath: string | null) => {
      const payload: any = {
        name: data.fullName,
        phone: data.mobileNumber,
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
          showSnackbar({ message: t('provider.basicInfoSaved'), type: 'success' });
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

  // 2. Skills & Experience State
  const [educationList, setEducationList] = useState<EducationItem[]>(
    user?.education && user.education.length > 0
      ? user.education.map((edu: any) => ({
          id: edu.id,
          degree: edu.degree || '',
          institution: edu.institute || '',
          startYear: edu.start_date ? edu.start_date.split('-')[0] : '',
          endYear: edu.end_date ? edu.end_date.split('-')[0] : 'Present',
        }))
      : [],
  );

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(
    user?.experience && user.experience.length > 0
      ? user.experience.map((exp: any) => ({
          id: exp.id,
          title: exp.title || '',
          company: exp.company_name || '',
          startYear: exp.start_date ? exp.start_date.split('-')[0] : '',
          endYear: exp.end_date ? exp.end_date.split('-')[0] : 'Present',
        }))
      : [],
  );

  const handleAddEducation = (item: EducationItem) => {
    setEducationList((prev) => [...prev, item]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExperience = (item: ExperienceItem) => {
    setExperienceList((prev) => [...prev, item]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSkills = () => {
    updateProfile(
      {
        education: educationList.map((edu) => ({
          id: edu.id,
          degree: edu.degree,
          institute: edu.institution,
          start_date: edu.startYear ? `${edu.startYear}-01-01` : '',
          end_date: edu.endYear && edu.endYear !== 'Present' ? `${edu.endYear}-12-31` : null,
        })),
        experience: experienceList.map((exp) => ({
          id: exp.id,
          title: exp.title,
          company_name: exp.company,
          start_date: exp.startYear ? `${exp.startYear}-01-01` : '',
          end_date: exp.endYear && exp.endYear !== 'Present' ? `${exp.endYear}-12-31` : null,
        })),
      },
      {
        onSuccess: () => showSnackbar({ message: t('provider.skillsExperienceSaved'), type: 'success' }),
      },
    );
  };

  // 3. Availability State
  const [workingDays, setWorkingDays] = useState<Availability>(
    (user?.availability as Availability) || AVAILABILITY_TYPES.Weekdays,
  );
  const [workingHoursStart, setWorkingHoursStart] = useState(user?.start_time || '10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(user?.end_time || DEFAULT_WORKING_HOURS_END);

  const handleSaveAvailability = () => {
    updateProfile(
      {
        availability: workingDays,
        start_time: workingHoursStart,
        end_time: workingHoursEnd,
      },
      {
        onSuccess: () => showSnackbar({ message: t('provider.availabilitySaved'), type: 'success' }),
      },
    );
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
          scrollRef={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
          <SectionHeader
            title={t('provider.editPartnerProfile')}
            description={t('provider.editProfileDesc')}
            className="mb-6"
            titleClassName="text-2xl text-gray-950 font-sans-extrabold"
          />

          {/* Basic Info Block */}
          <View onLayout={(e) => handleSectionLayout('basic', e.nativeEvent.layout.y)}>
            <BasicInfoSection
              control={control}
              errors={errors}
              setValue={setValue}
              watchLanguages={watchLanguages}
              watchDateOfBirth={watchDateOfBirth}
              watchAvatar={watchAvatar}
              onSave={handleSubmit(handleSaveBasicInfo)}
              loading={isUpdating || isUploading}
            />
          </View>

          {/* Skills & Experience Block */}
          <View onLayout={(e) => handleSectionLayout('skills', e.nativeEvent.layout.y)}>
            <SkillsExperienceSection
              educationList={educationList}
              experienceList={experienceList}
              onAddEducation={handleAddEducation}
              onRemoveEducation={handleRemoveEducation}
              onAddExperience={handleAddExperience}
              onRemoveExperience={handleRemoveExperience}
              onSave={handleSaveSkills}
              loading={isUpdating}
            />
          </View>

          {/* Availability Block */}
          <View onLayout={(e) => handleSectionLayout('availability', e.nativeEvent.layout.y)}>
            <AvailabilitySection
              workingDays={workingDays}
              onChangeWorkingDays={setWorkingDays}
              workingHoursStart={workingHoursStart}
              workingHoursEnd={workingHoursEnd}
              onChangeHours={(start, end) => {
                setWorkingHoursStart(start);
                setWorkingHoursEnd(end);
              }}
              onSave={handleSaveAvailability}
              loading={isUpdating}
            />
          </View>
        </ContentLayout>
      )}
    </View>
  );
}

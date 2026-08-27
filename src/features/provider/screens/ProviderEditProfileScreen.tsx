import React, { useEffect, useMemo, useRef, useState } from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { View, ActivityIndicator, ScrollView, Pressable, Text } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useSnackbar } from '@/components/ui/Snackbar';
import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

import BasicInfoSection, { BasicInfoFormData } from '@/features/customer/components/BasicInfoSection';
import SkillsExperienceSection, { EducationItem, ExperienceItem } from '../components/SkillsExperienceSection';
import AvailabilitySection from '../components/AvailabilitySection';
import ServiceStickyFooter from '../components/ServiceStickyFooter';

import { useAuth } from '@/providers/AuthProvider';
import { getImageUrl } from '@/utils/image';
import { formatPhone, unformatPhone } from '../../auth/utils/phone';
import { useUpdateProfile, useUploadFile } from '@/api';
import type { UpdateProfilePayload } from '@/types';
import { Availability } from '@/types';
import { AVAILABILITY_TYPES, DEFAULT_WORKING_HOURS_END, asAvailability } from '@/constants/availability';

type EditProfileTab = 'basic' | 'skills' | 'availability';

const getInitialTab = (sec?: string): EditProfileTab => {
  if (sec === 'education' || sec === 'experience' || sec === 'skills') return 'skills';
  if (sec === 'availability') return 'availability';
  return 'basic';
};

export default function ProviderEditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { section } = useLocalSearchParams<{ section?: string }>();

  const { showSnackbar } = useSnackbar();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  const [userTab, setUserTab] = useState<{ section?: string; tab: EditProfileTab }>({
    section,
    tab: getInitialTab(section),
  });

  const activeTab = userTab.section === section ? userTab.tab : getInitialTab(section);

  const tabItems = useMemo(
    () => [
      { id: 'basic' as EditProfileTab, label: t('components.basicInfo'), icon: 'user' as const },
      { id: 'skills' as EditProfileTab, label: t('provider.skillsAndExperience'), icon: 'award' as const },
      { id: 'availability' as EditProfileTab, label: t('provider.workingDays'), icon: 'clock' as const },
    ],
    [t],
  );

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
  const watchAvatar = useWatch({ control, name: 'avatar' }) || '';

  const handleSaveBasicInfo = (data: BasicInfoFormData) => {
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

  // 2. Skills & Experience State — hydrated in the profile effect below
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);

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

  // 3. Availability State — hydrated from the profile once it loads
  const [workingDays, setWorkingDays] = useState<Availability>(AVAILABILITY_TYPES.Weekdays);
  const [workingHoursStart, setWorkingHoursStart] = useState('10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(DEFAULT_WORKING_HOURS_END);

  // Hydrate local drafts exactly once when the profile lands (deep-link race fix).
  const hasHydratedProfileRef = useRef(false);
  useEffect(() => {
    if (!user || hasHydratedProfileRef.current) return;
    hasHydratedProfileRef.current = true;
    setEducationList(
      user.education && user.education.length > 0
        ? user.education.map((edu) => ({
            id: edu.id,
            degree: edu.degree || '',
            institution: edu.institute || '',
            startYear: edu.start_date ? edu.start_date.split('-')[0] : '',
            endYear: edu.end_date ? edu.end_date.split('-')[0] : 'Present',
          }))
        : [],
    );
    setExperienceList(
      user.experience && user.experience.length > 0
        ? user.experience.map((exp) => ({
            id: exp.id,
            title: exp.title || '',
            company: exp.company_name || '',
            startYear: exp.start_date ? exp.start_date.split('-')[0] : '',
            endYear: exp.end_date ? exp.end_date.split('-')[0] : 'Present',
          }))
        : [],
    );
    setWorkingDays(asAvailability(user.availability) ?? AVAILABILITY_TYPES.Weekdays);
    setWorkingHoursStart(user.start_time || '10:00 AM');
    setWorkingHoursEnd(user.end_time || DEFAULT_WORKING_HOURS_END);
  }, [user]);

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
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      ) : (
        <>
          <ContentLayout
            scrollable
            className="flex-1"
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom + 80, 100),
            }}
          >
            <SectionHeader
              title={t('navigation.editProfile')}
              description={t('provider.editProfileDesc')}
              className="mb-4"
              titleClassName="text-xl text-gray-950 font-sans-bold"
            />

            {/* Horizontal Scrollable Pill Tab Navigation Bar */}
            <View className="mb-5">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
                className="flex-row"
              >
                {tabItems.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setUserTab({ section, tab: tab.id })}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}
                      className={`flex-row items-center px-4 py-2.5 rounded-xl border mr-2.5 ${
                        isActive ? 'bg-primary border-primary shadow-sm' : 'bg-white border-gray-200 active:bg-gray-50'
                      }`}
                    >
                      <Feather
                        name={tab.icon}
                        size={15}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        className={`text-xs ${
                          isActive ? 'font-sans-bold text-white' : 'font-sans-semibold text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Active Tab Form Content */}
            {activeTab === 'basic' && (
              <BasicInfoSection
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                watchLanguages={watchLanguages}
                watchDateOfBirth={watchDateOfBirth}
                watchAvatar={watchAvatar}
                isProvider={true}
              />
            )}

            {activeTab === 'skills' && (
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
            )}

            {activeTab === 'availability' && (
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
            )}
          </ContentLayout>

          {activeTab === 'basic' && (
            <ServiceStickyFooter
              title={t('common.save')}
              onSave={handleSubmit(handleSaveBasicInfo)}
              loading={isUpdating || isUploading}
              disabled={isUpdating || isUploading}
            />
          )}
        </>
      )}
    </View>
  );
}

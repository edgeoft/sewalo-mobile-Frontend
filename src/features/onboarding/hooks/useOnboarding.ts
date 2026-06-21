import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants/routes';

import { personalInfoSchema, PersonalInfoData } from '../data/schemas';

import {
  useGetProfileQuery,
  useUpdateProfile,
  useCompleteProfile,
  UpdateProfilePayload,
  CompleteProfilePayload,
  Availability,
  EducationItemPayload,
  ExperienceItemPayload,
  LocationData,
} from '@/api/user';
import { useGetFinanceAccountsQuery, useCreateFinanceAccount } from '@/features/provider/api/hooks/finance';
import { useUploadFile } from '@/api/files/hooks';

import { FinanceAccountType } from '@/features/provider/api/types/finance';

import { parseTime12h, convertTimeTo24h } from '@/utils/time';

import { EducationItem, ExperienceItem } from '../components/SkillsExperienceStep';

export interface StepInfo {
  key: string;
  label: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function useOnboarding() {
  const router = useRouter();
  const { setRole, user } = useAuth();
  const { role: rawRole, phone } = useLocalSearchParams<{ role?: string; phone?: string }>();

  // Determine user role
  const role: 'customer' | 'provider' = rawRole === 'provider' ? 'provider' : 'customer';

  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // React Query API hooks
  const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery();
  const { data: financeAccountsResponse } = useGetFinanceAccountsQuery(role === 'provider');
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { mutateAsync: completeProfile } = useCompleteProfile();
  const { mutateAsync: createFinanceAccount } = useCreateFinanceAccount();
  const { mutateAsync: uploadFile } = useUploadFile();

  // --- Step 1: Personal Info Form State ---
  const {
    control: personalInfoControl,
    handleSubmit: handlePersonalInfoSubmit,
    setValue: setPersonalInfoValue,
    watch: watchPersonalInfo,
    formState: { errors: personalInfoErrors },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: '',
      mobileNumber: phone || user?.phone || '',
      location: '',
      languages: [],
      avatar: '',
      dateOfBirth: '',
    },
    mode: 'onBlur',
  });

  const watchLanguages = watchPersonalInfo('languages') || [];
  const watchDateOfBirth = watchPersonalInfo('dateOfBirth') || '';
  const watchAvatar = watchPersonalInfo('avatar') || '';

  // --- Step 2: Skills & Experience Form State (Provider Only) ---
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);

  // --- Step 3: Availability Form State (Provider Only) ---
  const [workingDays, setWorkingDays] = useState<'everyday' | 'sunday_friday' | 'weekend'>('sunday_friday');
  const [workingHoursStart, setWorkingHoursStart] = useState('10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('06:00 PM');

  const handleHoursChange = (start: string, end: string) => {
    setWorkingHoursStart(start);
    setWorkingHoursEnd(end);
  };

  // --- Step 4: Financial Details Form State (Provider Only) ---
  // Financial Details are now fully managed directly by PayoutAccountsManager
  // so no local react-hook-form state is needed here anymore.

  // --- Step 5: Identity Verification Form State ---
  const [documentImage, setDocumentImage] = useState<string | null>(null);

  // --- Configuration of form steps based on Role ---
  const steps: StepInfo[] =
    role === 'provider'
      ? [
          { key: 'welcome', label: 'Welcome' },
          { key: 'personal_info', label: 'Personal Details', subtitle: 'Step 1 of 5: Personal Details', icon: 'user' },
          {
            key: 'skills_experience',
            label: 'Skills & Experience',
            subtitle: 'Step 2 of 5: Skills & Experience',
            icon: 'briefcase',
          },
          { key: 'availability', label: 'Availability', subtitle: 'Step 3 of 5: Weekly Schedule', icon: 'calendar' },
          {
            key: 'financial_details',
            label: 'Financial Details',
            subtitle: 'Step 4 of 5: Bank Details',
            icon: 'dollar-sign',
          },
          {
            key: 'identity_verification',
            label: 'Identity Verification',
            subtitle: 'Step 5 of 5: ID Document',
            icon: 'shield',
          },
          { key: 'finish', label: 'Finish' },
        ]
      : [
          { key: 'welcome', label: 'Welcome' },
          { key: 'personal_info', label: 'Personal Details', subtitle: 'Step 1 of 2: Personal Details', icon: 'user' },
          {
            key: 'identity_verification',
            label: 'Identity Verification',
            subtitle: 'Step 2 of 2: ID Document',
            icon: 'shield',
          },
          { key: 'finish', label: 'Finish' },
        ];

  const totalFormSteps = steps.length - 2;

  // --- Prepopulate Onboarding Profile Data when Query Returns ---
  useEffect(() => {
    if (!profileResponse?.user) return;
    const profile = profileResponse.user;

    // Sync Zustand store
    useAuthStore.getState().updateUser(profile);

    // Prepopulate Personal Info values
    const fullLocation = [profile.address, profile.city, profile.state, profile.country].filter(Boolean).join(', ');
    setPersonalInfoValue('email', profile.email || '');
    setPersonalInfoValue('location', fullLocation || '');
    setPersonalInfoValue('lat', profile.coordinates?.lat);
    setPersonalInfoValue('lng', profile.coordinates?.lng);
    setPersonalInfoValue('city', profile.city || '');
    setPersonalInfoValue('state', profile.state || '');
    setPersonalInfoValue('country', profile.country || '');
    setPersonalInfoValue('dateOfBirth', profile.dob || '');
    setPersonalInfoValue('languages', profile.language || []);
    setPersonalInfoValue('avatar', profile.avatar || '');

    // Prepopulate Skills & Experience
    if (role === 'provider') {
      if (profile.education && profile.education.length > 0) {
        setEducation(
          profile.education.map((e: EducationItemPayload) => ({
            id: String(e.id),
            degree: e.degree || '',
            institute: e.institute || '',
            startDate: e.start_date ? e.start_date.split('-')[0] : '',
            endDate: e.end_date ? e.end_date.split('-')[0] : '',
          })),
        );
      }
      if (profile.experience && profile.experience.length > 0) {
        setExperience(
          profile.experience.map((e: ExperienceItemPayload) => ({
            id: String(e.id),
            title: e.title || '',
            companyName: e.company_name || '',
            startDate: e.start_date ? e.start_date.split('-')[0] : '',
            endDate: e.end_date ? e.end_date.split('-')[0] : '',
          })),
        );
      }

      // Prepopulate Availability
      if (profile.availability) {
        if (profile.availability === 'always') setWorkingDays('everyday');
        else if (profile.availability === 'weekdays') setWorkingDays('sunday_friday');
        else if (profile.availability === 'weekends') setWorkingDays('weekend');
      }

      // Prepopulate Hours
      const start12h = parseTime12h(profile.start_time);
      if (start12h) setWorkingHoursStart(start12h);

      const end12h = parseTime12h(profile.end_time);
      if (end12h) setWorkingHoursEnd(end12h);
    }

    // Prepopulate ID Document
    if (profile.document) {
      setDocumentImage(profile.document);
    }

    // Resume onboarding at the first incomplete step
    // Only runs on initial mount (activeIndex === 0) to prevent refetches from resetting progress.
    if (profile.email && activeIndex === 0) {
      const getInitialStepIndex = () => {
        const personalInfoValid = personalInfoSchema.safeParse({
          email: profile.email || '',
          location: fullLocation || '',
          dateOfBirth: profile.dob || '',
          languages: profile.language || [],
        }).success;

        if (!personalInfoValid) return 1;

        if (role === 'provider') {
          const hasEducation = profile.education && profile.education.length > 0;
          const hasExperience = profile.experience && profile.experience.length > 0;
          if (!hasEducation && !hasExperience) return 2;

          if (!profile.start_time || !profile.end_time) return 3;

          if (!profile.document) return 5;
        } else {
          if (!profile.document) return 2;
        }

        return steps.length - 1;
      };
      setActiveIndex(getInitialStepIndex());
    }
  }, [profileResponse, role]);

  // --- Prepopulate Finance Accounts when Query Returns ---
  // Handled entirely by PayoutAccountsManager using its own query hook

  const handleNext = async () => {
    const currentStepKey = steps[activeIndex].key;

    if (currentStepKey === 'welcome') {
      setActiveIndex(1);
      return;
    }

    if (currentStepKey === 'personal_info') {
      handlePersonalInfoSubmit(async (data) => {
        setLoading(true);
        try {
          let avatarPath = data.avatar || '';

          // Upload profile photo if it is a new local URI
          if (
            data.avatar &&
            (data.avatar.startsWith('file://') ||
              data.avatar.startsWith('ph://') ||
              data.avatar.startsWith('content://'))
          ) {
            const uploadRes = await uploadFile({ uri: data.avatar, folder: 'profile' });
            avatarPath = uploadRes.path;
          }

          let lat = data.lat || 27.700769;
          let lng = data.lng || 85.30014;
          let address = data.location;
          let city = data.city || '';
          let state = data.state || '';
          let country = data.country || '';

          if (!data.lat || !data.lng) {
            const parts = data.location.split(',').map((p: string) => p.trim());
            address = parts[0] || 'Kathmandu';
            city = parts[1] || parts[0] || 'Kathmandu';
            state = parts[2] || 'Bagmati';
            country = parts[3] || 'Nepal';
          }

          const payload: UpdateProfilePayload = {
            email: data.email,
            address,
            city,
            state,
            country,
            dob: data.dateOfBirth,
            coordinates: { lat, lng },
            language: data.languages,
          };
          if (avatarPath) {
            payload.avatar = avatarPath;
          }

          await updateProfile(payload);
          await refetchProfile();
          setActiveIndex(activeIndex + 1);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Failed to save personal details.';
          Alert.alert('Error', errMsg);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    if (currentStepKey === 'skills_experience') {
      setLoading(true);
      try {
        const educationPayload: EducationItemPayload[] = education
          .filter((e) => e.degree && e.institute && e.startDate)
          .map((e) => ({
            id: Number(e.id),
            degree: e.degree,
            institute: e.institute,
            start_date: `${e.startDate}-01-01`,
            end_date: e.endDate ? `${e.endDate}-01-01` : null,
          }));

        const experiencePayload: ExperienceItemPayload[] = experience
          .filter((e) => e.title && e.companyName && e.startDate)
          .map((e) => ({
            id: Number(e.id),
            title: e.title,
            company_name: e.companyName,
            start_date: e.startDate ? `${e.startDate}-01-01` : '',
            end_date: e.endDate ? `${e.endDate}-01-01` : null,
          }));

        const payload: UpdateProfilePayload = {};
        if (educationPayload.length > 0) payload.education = educationPayload;
        if (experiencePayload.length > 0) payload.experience = experiencePayload;

        if (Object.keys(payload).length > 0) {
          await updateProfile(payload);
          await refetchProfile();
        }
        setActiveIndex(activeIndex + 1);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to save skills and experience.';
        Alert.alert('Error', errMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStepKey === 'availability') {
      setLoading(true);
      try {
        let availability: Availability = 'always';
        if (workingDays === 'sunday_friday') availability = 'weekdays';
        else if (workingDays === 'weekend') availability = 'weekends';

        const payload: UpdateProfilePayload = {
          availability,
          start_time: convertTimeTo24h(workingHoursStart),
          end_time: convertTimeTo24h(workingHoursEnd),
        };

        await updateProfile(payload);
        await refetchProfile();
        setActiveIndex(activeIndex + 1);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to save availability settings.';
        Alert.alert('Error', errMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStepKey === 'financial_details') {
      setActiveIndex(activeIndex + 1);
      return;
    }

    if (currentStepKey === 'identity_verification') {
      setLoading(true);
      try {
        let documentPath = documentImage || '';

        // Upload ID Image if it is a new local URI
        if (
          documentImage &&
          (documentImage.startsWith('file://') ||
            documentImage.startsWith('ph://') ||
            documentImage.startsWith('content://'))
        ) {
          const uploadRes = await uploadFile({ uri: documentImage, folder: 'document' });
          documentPath = uploadRes.path;
        }

        if (documentPath) {
          await updateProfile({ document: documentPath });
          await refetchProfile();
        }
        setActiveIndex(activeIndex + 1);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to save identity documents.';
        Alert.alert('Error', errMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Default increment
    setActiveIndex(activeIndex + 1);
  };

  const handleSkip = () => {
    setActiveIndex(activeIndex + 1);
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else {
      router.back();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) throw new Error('User session not found.');

      // Format payloads to execute POST complete profile endpoint
      const payload: CompleteProfilePayload = {
        email: currentUser.email || '',
        address: currentUser.address || 'Kathmandu',
        city: currentUser.city || 'Kathmandu',
        state: currentUser.state || 'Bagmati',
        country: currentUser.country || 'Nepal',
        dob: currentUser.dob || '',
        coordinates: currentUser.coordinates || { lat: 27.700769, lng: 85.30014 },
        language: currentUser.language || [],
      };

      if (currentUser.avatar) {
        payload.avatar = currentUser.avatar;
      }
      if (currentUser.document) {
        payload.document = currentUser.document;
      }

      if (role === 'provider') {
        payload.education =
          currentUser.education?.map((e: EducationItemPayload) => ({
            id: e.id,
            degree: e.degree,
            institute: e.institute,
            start_date: e.start_date,
            end_date: e.end_date,
          })) || [];
        payload.experience =
          currentUser.experience?.map((e: ExperienceItemPayload) => ({
            id: e.id,
            title: e.title,
            company_name: e.company_name,
            start_date: e.start_date,
            end_date: e.end_date,
          })) || [];
        payload.availability = currentUser.availability || 'always';
        payload.start_time = currentUser.start_time || undefined;
        payload.end_time = currentUser.end_time || undefined;
      }

      await completeProfile(payload);
      setRole(role as UserRole);

      if (role === 'provider') {
        router.replace(ROUTES.provider.home as any);
      } else {
        router.replace(ROUTES.customer.home as any);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to finish profile registration.';
      Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[activeIndex];
  const isFormStep = currentStep.key !== 'welcome' && currentStep.key !== 'finish';

  return {
    activeIndex,
    setActiveIndex,
    loading,
    role,
    steps,
    totalFormSteps,
    isFormStep,
    currentStep,
    personalInfoControl,
    personalInfoErrors,
    setPersonalInfoValue,
    watchLanguages,
    watchDateOfBirth,
    watchAvatar,
    education,
    setEducation,
    experience,
    setExperience,
    workingDays,
    setWorkingDays,
    workingHoursStart,
    workingHoursEnd,
    handleHoursChange,
    documentImage,
    setDocumentImage,
    handleNext,
    handleSkip,
    handleBack,
    handleFinish,
    user,
  };
}

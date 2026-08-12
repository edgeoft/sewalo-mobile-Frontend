import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/ui/Snackbar';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';
import {
  AVAILABILITY_TYPES,
  DEFAULT_WORKING_HOURS_START,
  DEFAULT_WORKING_HOURS_END,
  AvailabilityType,
} from '@/constants/availability';
import {
  Availability,
  CompleteProfilePayload,
  EducationItemPayload,
  ExperienceItemPayload,
  PersonalInfoData,
  UpdateProfilePayload,
  UserRole,
  USER_ROLES,
} from '@/types';

import { personalInfoSchema } from '@/schemas/onboarding';

import { useCompleteProfile, useGetProfileQuery, useUpdateProfile, useUploadFile } from '@/api';

import { convertTimeTo24h, parseTime12h } from '@/utils/time';

export interface StepInfo {
  key: string;
  label: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function useOnboarding() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setRole, user } = useAuth();
  const { role: rawRole, phone } = useLocalSearchParams<{ role?: string; phone?: string }>();
  const { showSnackbar } = useSnackbar();

  const role: typeof USER_ROLES.Customer | typeof USER_ROLES.Provider =
    rawRole === USER_ROLES.Provider || user?.role === USER_ROLES.Provider ? USER_ROLES.Provider : USER_ROLES.Customer;

  const { data: profileResponse } = useGetProfileQuery();
  const profile = profileResponse?.user;

  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { mutateAsync: completeProfile } = useCompleteProfile();
  const { mutateAsync: uploadFile } = useUploadFile();

  const [loading, setLoading] = useState(false);

  const fullLocation = useMemo(
    () => (profile ? [profile.address, profile.city, profile.state, profile.country].filter(Boolean).join(', ') : ''),
    [profile],
  );

  const formValues = useMemo(
    () => ({
      fullName: user?.name || profile?.name || '',
      email: profile?.email || '',
      mobileNumber: phone || user?.phone || profile?.phone || '',
      location: fullLocation,
      lat: profile?.coordinates?.lat,
      lng: profile?.coordinates?.lng,
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || '',
      dateOfBirth: profile?.dob || '',
      languages: profile?.language || [],
      avatar: profile?.avatar || '',
    }),
    [user, profile, phone, fullLocation],
  );

  const {
    control: personalInfoControl,
    handleSubmit: handlePersonalInfoSubmit,
    setValue: setPersonalInfoValue,
    formState: { errors: personalInfoErrors },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    values: formValues,
    mode: 'onBlur',
  });

  const watchDateOfBirth = useWatch({ control: personalInfoControl, name: 'dateOfBirth' }) || '';
  const watchAvatar = useWatch({ control: personalInfoControl, name: 'avatar' }) || '';

  const [userWorkingDays, setUserWorkingDays] = useState<AvailabilityType | null>(null);
  const workingDays: AvailabilityType = useMemo(() => {
    if (userWorkingDays !== null) return userWorkingDays;
    if (profile?.availability === AVAILABILITY_TYPES.Always) return AVAILABILITY_TYPES.Always;
    if (profile?.availability === AVAILABILITY_TYPES.Weekdays) return AVAILABILITY_TYPES.Weekdays;
    if (profile?.availability === AVAILABILITY_TYPES.Weekends) return AVAILABILITY_TYPES.Weekends;
    return AVAILABILITY_TYPES.Weekdays;
  }, [userWorkingDays, profile?.availability]);

  const [userWorkingHoursStart, setUserWorkingHoursStart] = useState<string | null>(null);
  const workingHoursStart = useMemo(() => {
    if (userWorkingHoursStart !== null) return userWorkingHoursStart;
    const start12h = parseTime12h(profile?.start_time);
    return start12h || DEFAULT_WORKING_HOURS_START;
  }, [userWorkingHoursStart, profile?.start_time]);

  const [userWorkingHoursEnd, setUserWorkingHoursEnd] = useState<string | null>(null);
  const workingHoursEnd = useMemo(() => {
    if (userWorkingHoursEnd !== null) return userWorkingHoursEnd;
    const end12h = parseTime12h(profile?.end_time);
    return end12h || DEFAULT_WORKING_HOURS_END;
  }, [userWorkingHoursEnd, profile?.end_time]);

  const handleHoursChange = (start: string, end: string) => {
    setUserWorkingHoursStart(start);
    setUserWorkingHoursEnd(end);
  };

  const [userDocumentImage, setUserDocumentImage] = useState<string | null | undefined>(undefined);
  const documentImage = useMemo(() => {
    if (userDocumentImage !== undefined) return userDocumentImage;
    return profile?.document || null;
  }, [userDocumentImage, profile?.document]);

  const steps: StepInfo[] = useMemo(
    () =>
      role === USER_ROLES.Provider
        ? [
            { key: 'welcome', label: t('onboarding.stepWelcome') },
            {
              key: 'personal_info',
              label: t('onboarding.stepPersonalDetails'),
              subtitle: t('onboarding.stepPersonalDetailsSubtitleProvider'),
              icon: 'user',
            },
            {
              key: 'availability',
              label: t('onboarding.stepAvailability'),
              subtitle: t('onboarding.stepAvailabilitySubtitle'),
              icon: 'calendar',
            },
            {
              key: 'identity_verification',
              label: t('onboarding.stepIdentityVerification'),
              subtitle: t('onboarding.stepIdentitySubtitleProvider'),
              icon: 'shield',
            },
            { key: 'finish', label: t('onboarding.stepFinish') },
          ]
        : [
            { key: 'welcome', label: t('onboarding.stepWelcome') },
            {
              key: 'personal_info',
              label: t('onboarding.stepPersonalDetails'),
              subtitle: t('onboarding.stepPersonalDetailsSubtitleCustomer'),
              icon: 'user',
            },
            {
              key: 'identity_verification',
              label: t('onboarding.stepIdentityVerification'),
              subtitle: t('onboarding.stepIdentitySubtitleCustomer'),
              icon: 'shield',
            },
            { key: 'finish', label: t('onboarding.stepFinish') },
          ],
    [role, t],
  );

  const totalFormSteps = steps.length - 2;

  const initialStepIndex = useMemo(() => {
    if (!profile) return 0;

    const personalInfoValid = personalInfoSchema.safeParse({
      email: profile.email || '',
      location: fullLocation || '',
      dateOfBirth: profile.dob || '',
      avatar: profile.avatar || '',
    }).success;

    // If no email or dob has been set yet, start at Welcome step
    // (name is set during signup, so it's not an onboarding progress indicator)
    if (!profile.email && !profile.dob) return 0;
    // If personal details aren't complete yet, start at Personal Details step
    if (!personalInfoValid) return 1;

    if (role === USER_ROLES.Provider) {
      if (!profile.start_time || !profile.end_time) return 2;
      if (!profile.document) return 3;
    } else {
      if (!profile.document) return 2;
    }

    return steps.length - 1;
  }, [profile, fullLocation, role, steps.length]);

  const [userActiveIndex, setUserActiveIndex] = useState<number | null>(null);
  const activeIndex = userActiveIndex !== null ? userActiveIndex : initialStepIndex;

  const setActiveIndex = useCallback(
    (action: number | ((prev: number) => number)) => {
      setUserActiveIndex((current) => {
        const prev = current !== null ? current : initialStepIndex;
        return typeof action === 'function' ? action(prev) : action;
      });
    },
    [initialStepIndex],
  );

  const handleNext = async () => {
    if (loading) return;

    const currentStepKey = steps[activeIndex].key;

    if (currentStepKey === 'welcome') {
      setActiveIndex(1);
      return;
    }

    if (currentStepKey === 'personal_info') {
      handlePersonalInfoSubmit(
        async (data) => {
          setLoading(true);
          try {
            let avatarPath = data.avatar || '';

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

            const cleanVal = (val: string, fallback: string) => {
              if (!val || val.trim() === '' || val.toLowerCase() === 'n/a') {
                return fallback;
              }
              return val;
            };

            city = cleanVal(city, 'Kathmandu');
            state = cleanVal(state, 'Bagmati');
            country = cleanVal(country, 'Nepal');

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
            };
            if (avatarPath) {
              payload.avatar = avatarPath;
            }

            await updateProfile(payload);
            setActiveIndex((prev) => prev + 1);
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Failed to save personal details.';
            showSnackbar({ message: errMsg, type: 'error' });
          } finally {
            setLoading(false);
          }
        },
        (validationErrors) => {
          const firstError = Object.values(validationErrors)[0]?.message;
          if (firstError) {
            showSnackbar({ message: String(firstError), type: 'error' });
          }
        },
      )();
      return;
    }

    if (currentStepKey === 'availability') {
      setLoading(true);
      try {
        const availability: Availability = workingDays;

        const payload: UpdateProfilePayload = {
          availability,
          start_time: convertTimeTo24h(workingHoursStart),
          end_time: convertTimeTo24h(workingHoursEnd),
        };

        await updateProfile(payload);
        setActiveIndex((prev) => prev + 1);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to save availability settings.';
        showSnackbar({ message: errMsg, type: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStepKey === 'identity_verification') {
      setLoading(true);
      try {
        let documentPath = documentImage || '';

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
        }
        setActiveIndex((prev) => prev + 1);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to save identity documents.';
        showSnackbar({ message: errMsg, type: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    setActiveIndex((prev) => prev + 1);
  };

  const handleSkip = () => {
    if (loading) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (loading) return;
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) throw new Error('User session not found.');

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

      if (role === USER_ROLES.Provider) {
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
        payload.availability = currentUser.availability || AVAILABILITY_TYPES.Always;
        payload.start_time = currentUser.start_time || undefined;
        payload.end_time = currentUser.end_time || undefined;
      }

      await completeProfile(payload);
      setRole(role as UserRole);

      if (role === USER_ROLES.Provider) {
        router.replace(ROUTES.provider.home);
      } else {
        router.replace(ROUTES.customer.home);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to finish profile registration.';
      showSnackbar({ message: errMsg, type: 'error' });
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
    watchDateOfBirth,
    watchAvatar,
    workingDays,
    setWorkingDays: setUserWorkingDays,
    workingHoursStart,
    workingHoursEnd,
    handleHoursChange,
    documentImage,
    setDocumentImage: setUserDocumentImage,
    handleNext,
    handleSkip,
    handleBack,
    handleFinish,
    user,
  };
}

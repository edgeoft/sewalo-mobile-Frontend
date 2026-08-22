import {
  USER_ROLES,
  type Availability,
  type EducationItemPayload,
  type ExperienceItemPayload,
  PersonalInfoData,
  UpdateProfilePayload,
  CompleteProfilePayload,
  UserProfile,
  UserRole,
} from '@/types';
import { asAvailability, AVAILABILITY_TYPES } from '@/constants/availability';
import { convertTimeTo24h } from '@/utils/time';

/** Nepal-default fallbacks for incomplete location data (product decision). */
export const LOCATION_DEFAULTS = {
  lat: 27.700769,
  lng: 85.30014,
  city: 'Kathmandu',
  state: 'Bagmati',
  country: 'Nepal',
} as const;

const cleanVal = (val: string | undefined | null, fallback: string): string => {
  if (!val || val.trim() === '' || val.toLowerCase() === 'n/a') {
    return fallback;
  }
  return val;
};

/**
 * Builds the profile-update payload for the personal-info onboarding step.
 * Parses "address, city, state, country" CSV when coordinates are missing.
 */
export function buildPersonalInfoPayload(data: PersonalInfoData, avatarPath?: string): UpdateProfilePayload {
  let lat = data.lat ?? LOCATION_DEFAULTS.lat;
  let lng = data.lng ?? LOCATION_DEFAULTS.lng;
  let address = data.location;
  let city = cleanVal(data.city, '');
  let state = cleanVal(data.state, '');
  let country = cleanVal(data.country, '');

  if (!data.lat || !data.lng) {
    const parts = data.location.split(',').map((p: string) => p.trim());
    lat = LOCATION_DEFAULTS.lat;
    lng = LOCATION_DEFAULTS.lng;
    address = parts[0] || LOCATION_DEFAULTS.city;
    city = parts[1] || parts[0] || LOCATION_DEFAULTS.city;
    state = parts[2] || LOCATION_DEFAULTS.state;
    country = parts[3] || LOCATION_DEFAULTS.country;
  }

  const payload: UpdateProfilePayload = {
    email: data.email,
    address,
    city: city || LOCATION_DEFAULTS.city,
    state: state || LOCATION_DEFAULTS.state,
    country: country || LOCATION_DEFAULTS.country,
    dob: data.dateOfBirth,
    coordinates: { lat, lng },
  };
  if (avatarPath) {
    payload.avatar = avatarPath;
  }
  return payload;
}

/** Availability step payload. */
export function buildAvailabilityPayload(
  availability: Availability,
  startTime: string,
  endTime: string,
): UpdateProfilePayload {
  return {
    availability,
    start_time: convertTimeTo24h(startTime),
    end_time: convertTimeTo24h(endTime),
  };
}

/**
 * Builds the final complete-profile payload from the current session user.
 * Provider role additionally carries education/experience/availability.
 */
export function buildCompleteProfilePayload(user: UserProfile, role: UserRole): CompleteProfilePayload {
  const payload: CompleteProfilePayload = {
    email: user.email || '',
    address: user.address || LOCATION_DEFAULTS.city,
    city: user.city || LOCATION_DEFAULTS.city,
    state: user.state || LOCATION_DEFAULTS.state,
    country: user.country || LOCATION_DEFAULTS.country,
    dob: user.dob || '',
    coordinates: user.coordinates || { lat: LOCATION_DEFAULTS.lat, lng: LOCATION_DEFAULTS.lng },
    language: user.language || [],
  };

  if (user.avatar) {
    payload.avatar = user.avatar;
  }
  if (user.document) {
    payload.document = user.document;
  }

  if (role === USER_ROLES.Provider) {
    const education: EducationItemPayload[] =
      user.education?.map((e) => ({
        id: e.id,
        degree: e.degree,
        institute: e.institute,
        start_date: e.start_date,
        end_date: e.end_date,
      })) || [];
    const experience: ExperienceItemPayload[] =
      user.experience?.map((e) => ({
        id: e.id,
        title: e.title,
        company_name: e.company_name,
        start_date: e.start_date,
        end_date: e.end_date,
      })) || [];
    payload.education = education;
    payload.experience = experience;
    payload.availability = asAvailability(user.availability) ?? AVAILABILITY_TYPES.Always;
    payload.start_time = user.start_time || undefined;
    payload.end_time = user.end_time || undefined;
  }

  return payload;
}

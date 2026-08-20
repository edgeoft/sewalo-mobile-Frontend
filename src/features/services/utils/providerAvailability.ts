import type { TFunction } from 'i18next';
import { AVAILABILITY_TYPES, WORKING_DAYS_OPTIONS } from '@/constants/availability';
import type { UserProfile } from '@/types';
import { formatTime } from '@/utils/time';

export type ProviderAvailabilityInfo = Partial<
  Pick<UserProfile, 'availability' | 'availability_days' | 'start_time' | 'end_time'>
>;

const DAY_INDEX_BY_LABEL: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
};

const WEEKDAY_INDEXES = [1, 2, 3, 4, 5];
const WEEKEND_INDEXES = [0, 6];
const ALL_DAY_INDEXES = [0, 1, 2, 3, 4, 5, 6];

export const getTimeInMinutes = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const formatted = formatTime(value);
  if (!formatted) return null;
  const match = formatted.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
};

export const getDateString = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isTodayDate = (serviceDate: string): boolean => {
  return serviceDate === getDateString(new Date());
};

export const isPastDate = (serviceDate: string): boolean => {
  if (!serviceDate) return false;
  const [year, month, day] = serviceDate.split('-').map(Number);
  if (!year || !month || !day) return false;
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate.getTime() < today.getTime();
};

export const parseWorkingHoursFromText = (
  text: string | null | undefined,
): { startTime: string | null; endTime: string | null } => {
  if (!text) return { startTime: null, endTime: null };
  const matches = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (!matches) return { startTime: null, endTime: null };

  const convertTo24 = (timeStr: string): string | null => {
    const trimmed = timeStr.trim();
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let h = parseInt(ampmMatch[1], 10);
      const m = ampmMatch[2];
      const period = ampmMatch[3].toUpperCase();
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${m}`;
    }
    const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (h24Match) {
      return `${String(parseInt(h24Match[1], 10)).padStart(2, '0')}:${h24Match[2]}`;
    }
    return null;
  };

  return {
    startTime: convertTo24(matches[1]),
    endTime: convertTo24(matches[2]),
  };
};

export const getProviderWorkingHours = (
  provider: ProviderAvailabilityInfo | null | undefined,
): { startTime: string | null; endTime: string | null } => {
  if (!provider) return { startTime: null, endTime: null };

  const startTime = provider.start_time ? formatTime(provider.start_time) : null;
  const endTime = provider.end_time ? formatTime(provider.end_time) : null;

  return { startTime, endTime };
};

export const getSelectedDayIndexes = (provider: ProviderAvailabilityInfo | null | undefined): number[] => {
  if (!provider) return ALL_DAY_INDEXES;

  if (provider.availability_days) {
    const rawDaysList = Array.isArray(provider.availability_days)
      ? provider.availability_days
      : typeof provider.availability_days === 'string'
        ? (provider.availability_days as string).split(',')
        : [];

    const days = rawDaysList
      .map((value) =>
        value
          .replace(/\[|\]|"/g, '')
          .trim()
          .toLowerCase(),
      )
      .map((value) => DAY_INDEX_BY_LABEL[value])
      .filter((value): value is number => value !== undefined);

    if (days.length > 0) return days;
  }

  if (
    provider.availability === AVAILABILITY_TYPES.Weekdays ||
    provider.availability === WORKING_DAYS_OPTIONS.SundayFriday
  ) {
    return WEEKDAY_INDEXES;
  }

  if (provider.availability === AVAILABILITY_TYPES.Weekends || provider.availability === WORKING_DAYS_OPTIONS.Weekend) {
    return WEEKEND_INDEXES;
  }

  return ALL_DAY_INDEXES;
};

export const isProviderWorkingDay = (
  provider: ProviderAvailabilityInfo | null | undefined,
  serviceDate: string,
): boolean => {
  if (!provider || !serviceDate) return true;
  const [year, month, day] = serviceDate.split('-').map(Number);
  if (!year || !month || !day) return false;
  const selectedDate = new Date(year, month - 1, day);
  if (isNaN(selectedDate.getTime())) return false;
  const selectedDay = selectedDate.getDay();
  const allowedDays = getSelectedDayIndexes(provider);
  return allowedDays.includes(selectedDay);
};

export const isProviderWorkingTime = (
  provider: ProviderAvailabilityInfo | null | undefined,
  startTime: string,
): boolean => {
  if (!provider || !startTime) return true;
  const selectedMinutes = getTimeInMinutes(startTime);
  if (selectedMinutes === null) return false;

  const workingHours = getProviderWorkingHours(provider);
  const startMinutes = getTimeInMinutes(workingHours.startTime);
  const endMinutes = getTimeInMinutes(workingHours.endTime);

  if (startMinutes === null || endMinutes === null) return true;
  return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
};

export const isPastTimeForToday = (serviceDate: string, startTime: string): boolean => {
  if (!isTodayDate(serviceDate) || !startTime) return false;
  const selectedMinutes = getTimeInMinutes(startTime);
  const currentMinutes = getTimeInMinutes(getCurrentTimeString());
  if (selectedMinutes === null || currentMinutes === null) return false;
  return selectedMinutes < currentMinutes;
};

export const getProviderAvailabilityError = (
  t: TFunction,
  provider: ProviderAvailabilityInfo | null | undefined,
  serviceDate: string,
  startTime: string,
): { serviceDateError?: string; startTimeError?: string } => {
  if (isPastDate(serviceDate)) {
    return { serviceDateError: t('services.pastDateNotAllowed') };
  }

  if (!isProviderWorkingDay(provider, serviceDate)) {
    return { serviceDateError: t('services.notWorkingDay') };
  }

  if (isPastTimeForToday(serviceDate, startTime)) {
    return { startTimeError: t('services.pastTimeNotAllowed') };
  }

  if (!isProviderWorkingTime(provider, startTime)) {
    const workingHours = getProviderWorkingHours(provider);
    if (workingHours.startTime && workingHours.endTime) {
      return {
        startTimeError: t('services.outsideWorkingHours', {
          start: workingHours.startTime,
          end: workingHours.endTime,
        }),
      };
    }
    return { startTimeError: t('services.outsideWorkingHoursGeneric') };
  }

  return {};
};

export const formatTimeLabel = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '';
  const formatted = formatTime(timeStr);
  if (!formatted) return timeStr.trim();
  const match24 = formatted.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    let hour = parseInt(match24[1], 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour} ${period}`;
  }
  return formatted;
};

export const formatProviderSchedule = (
  provider: ProviderAvailabilityInfo | null | undefined,
  _t?: TFunction,
): string | null => {
  if (!provider) return null;

  const hasHours = Boolean(provider.start_time || provider.end_time);
  const hasDays = Boolean(provider.availability_days || provider.availability);

  if (!hasHours && !hasDays) {
    return null;
  }

  const workingHours = getProviderWorkingHours(provider);
  const start = formatTimeLabel(workingHours.startTime);
  const end = formatTimeLabel(workingHours.endTime);
  const timeLabel = start && end ? `${start} - ${end}` : start || end || '';

  let daysLabel: string | null = null;
  if (provider.availability_days || provider.availability) {
    const dayIndexes = getSelectedDayIndexes(provider);
    if (dayIndexes.length === 7) {
      daysLabel = 'Everyday';
    } else if (
      dayIndexes.length === 5 &&
      dayIndexes.includes(1) &&
      dayIndexes.includes(2) &&
      dayIndexes.includes(3) &&
      dayIndexes.includes(4) &&
      dayIndexes.includes(5)
    ) {
      daysLabel = 'Mon - Fri';
    } else if (
      dayIndexes.length === 6 &&
      dayIndexes.includes(0) &&
      dayIndexes.includes(1) &&
      dayIndexes.includes(2) &&
      dayIndexes.includes(3) &&
      dayIndexes.includes(4) &&
      dayIndexes.includes(5)
    ) {
      daysLabel = 'Sun - Fri';
    } else if (dayIndexes.length === 2 && dayIndexes.includes(0) && dayIndexes.includes(6)) {
      daysLabel = 'Weekends';
    } else if (dayIndexes.length === 1 && dayIndexes.includes(6)) {
      daysLabel = 'Saturday';
    }
  }

  if (daysLabel && timeLabel) {
    return `${daysLabel} • ${timeLabel}`;
  }
  return daysLabel || timeLabel || null;
};

export const getProviderAvailabilityBadge = (
  provider: ProviderAvailabilityInfo | null | undefined,
  t: TFunction,
): string | null => {
  if (!provider) return null;

  const hasAvailabilityData = Boolean(provider.availability || provider.start_time || provider.availability_days);
  if (!hasAvailabilityData) return null;

  if (provider.availability === 'unavailable') {
    return null;
  }

  if (provider.availability === 'always') {
    return t('services.availableToday');
  }

  const todayStr = getDateString(new Date());
  const isWorkingToday = isProviderWorkingDay(provider, todayStr);

  if (isWorkingToday) {
    const workingHours = getProviderWorkingHours(provider);
    const endMinutes = getTimeInMinutes(workingHours.endTime);
    const currentMinutes = getTimeInMinutes(getCurrentTimeString());

    if (endMinutes === null || currentMinutes === null || currentMinutes <= endMinutes) {
      return t('services.availableToday');
    }
  }

  // Check tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getDateString(tomorrow);
  if (isProviderWorkingDay(provider, tomorrowStr)) {
    return t('services.availableTomorrow');
  }

  return null;
};

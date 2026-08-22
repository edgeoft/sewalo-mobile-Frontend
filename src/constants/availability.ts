// ponytail: Centralized availability and schedule settings for onboarding & profile setup
export const AVAILABILITY_TYPES = {
  Always: 'always',
  Weekdays: 'weekdays',
  Weekends: 'weekends',
} as const;

export const WORKING_DAYS_OPTIONS = {
  Everyday: 'everyday',
  SundayFriday: 'sunday_friday',
  Weekend: 'weekend',
} as const;

/** Canonical day-list per availability type — single source for payload building. */
export const AVAILABILITY_WORKING_DAYS = {
  [AVAILABILITY_TYPES.Always]: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  [AVAILABILITY_TYPES.Weekdays]: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  [AVAILABILITY_TYPES.Weekends]: ['saturday'],
} as const satisfies Record<AvailabilityType, string[]>;

export const DEFAULT_WORKING_HOURS_START = '09:00 AM';
export const DEFAULT_WORKING_HOURS_END = '06:00 PM';

export type WorkingDaysOption = (typeof WORKING_DAYS_OPTIONS)[keyof typeof WORKING_DAYS_OPTIONS];
export type AvailabilityType = (typeof AVAILABILITY_TYPES)[keyof typeof AVAILABILITY_TYPES];

const AVAILABILITY_VALUES: string[] = Object.values(AVAILABILITY_TYPES);

/**
 * Safely narrows a raw wire value (UserProfile.availability arrives as `string | null`)
 * into an AvailabilityType, or null when it doesn't match a known value.
 */
export function asAvailability(value: string | null | undefined): AvailabilityType | null {
  if (value && AVAILABILITY_VALUES.includes(value)) {
    return value as AvailabilityType;
  }
  return null;
}

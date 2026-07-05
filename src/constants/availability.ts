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

export const WORKING_DAYS_MAPPING = {
  [WORKING_DAYS_OPTIONS.Everyday]: {
    availability: AVAILABILITY_TYPES.Always,
    days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  },
  [WORKING_DAYS_OPTIONS.SundayFriday]: {
    availability: AVAILABILITY_TYPES.Weekdays,
    days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  [WORKING_DAYS_OPTIONS.Weekend]: {
    availability: AVAILABILITY_TYPES.Weekends,
    days: ['saturday'],
  },
} as const;

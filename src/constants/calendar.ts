/**
 * Single source of truth for calendar/wheel-picker constants.
 */
export const MONTHS: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Zero-padded 12-hour clock hours, ascending: '01'..'12'. */
export const HOURS_12: string[] = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

/** Quarter-hour wheel options. */
export const MINUTES_15: string[] = ['00', '15', '30', '45'];

export const PERIODS = ['AM', 'PM'] as const;

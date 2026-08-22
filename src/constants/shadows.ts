import { THEME_COLORS } from './colors';

/**
 * Canonical card shadows. Use these instead of hand-rolled `shadowColor` objects.
 */
export const cardShadow = {
  shadowColor: THEME_COLORS.slate900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 0,
} as const;

export const softShadow = {
  shadowColor: THEME_COLORS.slate900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.02,
  shadowRadius: 4,
  elevation: 0,
} as const;

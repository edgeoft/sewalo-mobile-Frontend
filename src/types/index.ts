export const USER_ROLES = {
  Customer: 'customer',
  Provider: 'provider',
  Guest: 'guest',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

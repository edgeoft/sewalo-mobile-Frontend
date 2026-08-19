/**
 * Centralized Web URLs configuration.
 */
export const WEB_BASE_URL = 'https://dev.sewalo.com';

export const WEB_URLS = {
  base: WEB_BASE_URL,
  providerProfile: (slugOrId: string) => `${WEB_BASE_URL}/services/${slugOrId}`,
  signupReferral: (code: string) => `${WEB_BASE_URL}/signup?referral=${code}`,
} as const;

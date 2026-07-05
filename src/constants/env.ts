/**
 * Centralized Application Environment Constants.
 * Reads variables injected by Expo (EXPO_PUBLIC_ prefix required).
 * Provides safe defaults for development.
 */
export const ENV = {
  /**
   * The base URL for the REST API endpoints (e.g. http://localhost:8000/api).
   */
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/',

  /**
   * The base URL for the S3 bucket hosting profile avatars and other uploaded resources.
   */
  S3_BASE_URL: process.env.EXPO_PUBLIC_S3_BASE_URL || 'https://sewalo-dev.s3.ap-south-1.amazonaws.com/',

  /**
   * The current deployment environment (e.g. dev, production).
   */
  APP_ENV: process.env.EXPO_PUBLIC_ENV || 'dev',

  /**
   * Google Maps API Key for maps and geocoding services.
   */
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',

  /**
   * PostHog Project Token (starts with phc_).
   */
  POSTHOG_PROJECT_TOKEN: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || '',

  /**
   * PostHog Personal/Secret API Key (starts with phx_).
   */
  POSTHOG_API_KEY: process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',

  /**
   * PostHog Host Instance URL.
   */
  POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
};

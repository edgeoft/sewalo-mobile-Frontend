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
   * Google Maps API Key for maps and geocoding services.
   * Note: Non-public keys are read from process.env.GOOGLE_MAPS_API_KEY or EXPO_PUBLIC_GOOGLE_MAPS_API_KEY fallback.
   */
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',

  /**
   * PostHog Personal API Key (non-public / secret key).
   */
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || '',

  /**
   * PostHog Project Token (starts with phc_).
   */
  POSTHOG_PROJECT_TOKEN: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || '',

  /**
   * PostHog Host Instance URL.
   */
  POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',

  /**
   * Application environment (development, staging, production).
   */
  APP_ENV: process.env.EXPO_PUBLIC_ENV || 'development',
};

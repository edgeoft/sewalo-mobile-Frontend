import { createApiClient } from '../client/factory';
import { ENV } from '@/constants/env';

// Configured singleton instance of the API Client for our internal backend
export const internalClient = createApiClient({
  name: 'internal-backend',
  baseURL: ENV.API_BASE_URL,
  env: 'dev',
  timeout: 10000,
  auth: {
    mode: 'single',
    refreshURL: '/auth/refresh',
    getAccessToken: async () => {
      return null;
    },
    getRefreshToken: async () => {
      return null;
    },
    onTokenRefreshed: () => {},
    onAuthFailure: () => {
      console.warn('[Auth] Internal backend authentication failed');
    },
    proactiveRefreshSeconds: 60,
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 15000,
    jitter: true,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
  cache: {
    ttl: 30000, // 30 seconds
  },
});

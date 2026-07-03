// Core Types & Factory
export { createApiClient } from './client/factory';
export {
  RequestCtx,
  ResponseCtx,
  ApiClientConfig,
  ApiError,
  createApiError,
  Tokens,
  SingleTokenConfig,
  TokenSlotConfig,
  MultiSlotConfig,
  AuthConfig,
  RetryConfig,
  CacheConfig,
  TelemetryHooks,
  MockConfig,
  TokenManager,
  ApiClient,
  ApiMethod,
} from './client/types';

export { StorageAdapter, secureStorageAdapter, createFallbackStorageAdapter } from './client/auth/storage';

// Query Integration
export { queryClient } from './client/query/queryClient';
export { defaultQueryOptions } from './client/query/queryConfig';
export { globalErrorHandler } from './client/query/errorHandler';

// Configured client singletons
export { internalClient } from './client/instances/internal';

// Services API re-exports
export * from './services/user';
export * from './services/bookings';
export * from './services/categories';
export * from './services/files';
export * from './services/notifications';
export * from './services/referral';
export * from './services/auth';
export * from './services/provider';
export * from './services/settings';
export * from './services/blog';

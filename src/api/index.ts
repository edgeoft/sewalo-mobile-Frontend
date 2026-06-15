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
  CircuitState,
  CircuitBreakerConfig,
  CacheConfig,
  TelemetryHooks,
  MockConfig,
  TokenManager,
  ApiClient,
  ApiMethod,
} from './client/types';

// Storage Adapter
export { StorageAdapter, secureStorageAdapter, createMemoryStorageAdapter } from './auth/storage';

// Query Integration
export { queryClient } from './query/queryClient';
export { defaultQueryOptions } from './query/queryConfig';
export { globalErrorHandler } from './query/errorHandler';

// Configured client singletons
export { internalClient } from './clients/internal';

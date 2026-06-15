import { ApiClient, ApiClientConfig, RequestCtx, TokenManager } from './types';
import { axiosAdapter } from './adapter';
import { compose } from './pipeline';
import { correlationIdInterceptor } from '../interceptors/correlationId.interceptor';
import { loggingInterceptor } from '../interceptors/logging.interceptor';
import { telemetryInterceptor } from '../interceptors/telemetry.interceptor';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { createSingleTokenManager } from '../auth/singleTokenManager';
import { createSlotTokenManager } from '../auth/slotManager';
import { secureStorageAdapter } from '../auth/storage';
import { createCacheStore } from '../cache/cacheStore';
import { cacheInterceptor } from '../cache/invalidation';
import { createDeduplicator, deduplicationInterceptor } from '../resilience/deduplication';
import { createCircuitBreaker, circuitBreakerInterceptor } from '../resilience/circuitBreaker';
import { retryInterceptor } from '../resilience/retry';
import { createOfflineQueue } from '../resilience/offlineQueue';

export const createApiClient = (
  config: ApiClientConfig,
): ApiClient & {
  tokenManager?: TokenManager;
  offlineQueue?: ReturnType<typeof createOfflineQueue>;
  cacheStore?: ReturnType<typeof createCacheStore>;
} => {
  const timeout = config.timeout ?? 10000;
  const env = config.env ?? 'dev';

  const retryConfig = {
    maxAttempts: config.retry?.maxAttempts ?? 3,
    baseDelayMs: config.retry?.baseDelayMs ?? 500,
    maxDelayMs: config.retry?.maxDelayMs ?? 30000,
    jitter: config.retry?.jitter ?? true,
    retryableStatuses: config.retry?.retryableStatuses ?? [408, 429, 500, 502, 503, 504],
    shouldRetry: config.retry?.shouldRetry,
  };

  const circuitBreakerConfig = config.circuitBreaker
    ? {
        failureThreshold: config.circuitBreaker.failureThreshold ?? 5,
        successThreshold: config.circuitBreaker.successThreshold ?? 2,
        recoveryWindowMs: config.circuitBreaker.recoveryWindowMs ?? 30000,
        onStateChange: config.circuitBreaker.onStateChange,
      }
    : undefined;

  let tokenManager: TokenManager | undefined;
  if (config.auth) {
    if (config.auth.mode === 'single') {
      tokenManager = createSingleTokenManager(config.auth, secureStorageAdapter, config.baseURL);
    } else {
      tokenManager = createSlotTokenManager(config.auth, secureStorageAdapter, config.baseURL);
    }
  }

  const cacheStore = config.cache ? createCacheStore(config.cache) : undefined;
  const deduplicator = createDeduplicator();
  const circuitBreaker = circuitBreakerConfig
    ? createCircuitBreaker(circuitBreakerConfig, config.telemetry)
    : undefined;

  const baseAdapter = axiosAdapter;

  const buildRunner = () => {
    const interceptors = [
      correlationIdInterceptor,
      loggingInterceptor({ ...config, env }),
      telemetryInterceptor(config.telemetry),
      ...(cacheStore ? [cacheInterceptor(cacheStore)] : []),
      ...(tokenManager ? [authInterceptor(tokenManager)] : []),
      deduplicationInterceptor(deduplicator),
      retryInterceptor(retryConfig, config.telemetry),
      ...(circuitBreaker ? [circuitBreakerInterceptor(circuitBreaker)] : []),
      ...(config.interceptors || []),
    ];
    return compose(interceptors, baseAdapter);
  };

  const runner = buildRunner();
  const offlineQueue = createOfflineQueue(runner);

  const request = async <T = any>(reqCtx: RequestCtx): Promise<T> => {
    if (!offlineQueue.isOnline() && reqCtx.method !== 'GET') {
      const offlineRes = await offlineQueue.enqueue(reqCtx);
      return offlineRes.data as T;
    }

    const res = await runner(reqCtx);
    return res.data as T;
  };

  const get = async <T = any>(url: string, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method'>): Promise<T> => {
    return request<T>({
      url: url.startsWith('http') ? url : `${config.baseURL}${url}`,
      method: 'GET',
      timeout,
      ...reqConfig,
    });
  };

  const post = async <T = any>(
    url: string,
    data?: any,
    reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>,
  ): Promise<T> => {
    return request<T>({
      url: url.startsWith('http') ? url : `${config.baseURL}${url}`,
      method: 'POST',
      data,
      timeout,
      ...reqConfig,
    });
  };

  const put = async <T = any>(
    url: string,
    data?: any,
    reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>,
  ): Promise<T> => {
    return request<T>({
      url: url.startsWith('http') ? url : `${config.baseURL}${url}`,
      method: 'PUT',
      data,
      timeout,
      ...reqConfig,
    });
  };

  const patch = async <T = any>(
    url: string,
    data?: any,
    reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>,
  ): Promise<T> => {
    return request<T>({
      url: url.startsWith('http') ? url : `${config.baseURL}${url}`,
      method: 'PATCH',
      data,
      timeout,
      ...reqConfig,
    });
  };

  const del = async <T = any>(url: string, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method'>): Promise<T> => {
    return request<T>({
      url: url.startsWith('http') ? url : `${config.baseURL}${url}`,
      method: 'DELETE',
      timeout,
      ...reqConfig,
    });
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    request: <T = any>(reqConfig: RequestCtx) => {
      const mergedConfig = {
        timeout,
        ...reqConfig,
        url: reqConfig.url.startsWith('http') ? reqConfig.url : `${config.baseURL}${reqConfig.url}`,
      };
      return request<T>(mergedConfig);
    },
    tokenManager,
    offlineQueue,
    cacheStore,
  };
};

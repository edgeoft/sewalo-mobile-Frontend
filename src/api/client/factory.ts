import { create, InternalAxiosRequestConfig } from 'axios';
import { ApiClient, ApiClientConfig, RequestCtx, TokenManager, createApiError } from './types';
import { createSingleTokenManager } from './auth/singleTokenManager';
import { createSlotTokenManager } from './auth/slotManager';
import { secureStorageAdapter } from './auth/storage';

interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: {
    startTime?: number;
  };
}

// ponytail: uuid generation for correlation ID
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  let d = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = ((d + r) % 16) | 0;
      d = Math.floor(d / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

// ponytail: S3 parameter cleaning helper - recursively strips S3 signed query params
const cleanPayloadInPlace = (data: unknown): unknown => {
  if (typeof data === 'string') {
    return data.includes('?X-Amz-') || data.includes('?X-Amz-Algorithm') ? data.split('?')[0] : data;
  }
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(cleanPayloadInPlace);
  }
  if (data instanceof FormData) {
    return data;
  }
  for (const key of Object.keys(data as Record<string, unknown>)) {
    (data as Record<string, unknown>)[key] = cleanPayloadInPlace((data as Record<string, unknown>)[key]);
  }
  return data;
};

// ponytail: check if cross origin url
const isCrossOrigin = (url: string, baseURL: string): boolean => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  try {
    return url.split('/')[2] !== baseURL.split('/')[2];
  } catch {
    return true;
  }
};

// ponytail: sensitive data redaction helper
const redact = (obj: unknown): unknown => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    const lowKey = key.toLowerCase();
    if (
      lowKey.includes('password') ||
      lowKey.includes('token') ||
      lowKey.includes('authorization') ||
      lowKey.includes('secret') ||
      lowKey.includes('card')
    ) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redact(val);
    }
  }
  return result;
};

export const createApiClient = (
  config: ApiClientConfig,
): ApiClient & {
  tokenManager?: TokenManager;
} => {
  const baseURL = config.baseURL;
  const timeout = config.timeout ?? 10000;
  const isProd = config.env === 'prod';
  const name = config.name || 'API';

  // Initialize token manager if auth config is provided
  let tokenManager: TokenManager | undefined;
  if (config.auth) {
    if (config.auth.mode === 'single') {
      tokenManager = createSingleTokenManager(config.auth, secureStorageAdapter, baseURL);
    } else {
      tokenManager = createSlotTokenManager(config.auth, secureStorageAdapter, baseURL);
    }
  }

  // ponytail: simplified client using standard axios instance and interceptors instead of complex custom runners/deduplicators
  const axiosInstance = create({
    baseURL,
    timeout,
    headers: config.headers,
  });

  // Request Interceptor: Correlation ID, Clean S3, and Auth
  axiosInstance.interceptors.request.use(async (axiosConfig) => {
    const correlationId = generateUUID();
    axiosConfig.headers = axiosConfig.headers || {};
    axiosConfig.headers['X-Correlation-ID'] = correlationId;
    (axiosConfig as RequestConfigWithMetadata).metadata = { startTime: Date.now() };

    if (axiosConfig.data) {
      cleanPayloadInPlace(axiosConfig.data);
    }

    if (tokenManager && axiosConfig.url) {
      if (!isCrossOrigin(axiosConfig.url, baseURL)) {
        // Retrieve access token (handling automatic refresh if needed)
        const token = await tokenManager.getAccessToken();
        if (token) {
          axiosConfig.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    if (!isProd) {
      const fullUrl = axiosConfig.baseURL
        ? `${axiosConfig.baseURL.replace(/\/$/, '')}/${axiosConfig.url?.replace(/^\//, '')}`
        : axiosConfig.url;
      console.log(`[API-CLIENT][${name}][REQ] [ID: ${correlationId}] ${axiosConfig.method?.toUpperCase()} ${fullUrl}`, {
        headers: redact(axiosConfig.headers),
        params: redact(axiosConfig.params),
        data: redact(axiosConfig.data),
      });
    }

    return axiosConfig;
  });

  // Response Interceptor: 401 Refresh & Logging
  axiosInstance.interceptors.response.use(
    async (response) => {
      const correlationId = response.config.headers['X-Correlation-ID'] || 'N/A';
      const startTime = (response.config as RequestConfigWithMetadata).metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;

      if (!isProd) {
        console.log(
          `[API-CLIENT][${name}][RES] [ID: ${correlationId}] ${response.config.method?.toUpperCase()} ${response.config.url} - Status ${response.status} (${duration}ms)`,
          { data: redact(response.data) },
        );
      }

      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const correlationId = originalRequest?.headers?.['X-Correlation-ID'] || 'N/A';
      const startTime = originalRequest?.metadata?.startTime;
      const duration = startTime ? Date.now() - startTime : 0;
      const status = error.response?.status || 'N/A';
      const code = error.code || 'N/A';

      if (error.response?.status === 401 && !originalRequest._retry && tokenManager?.canRefresh()) {
        originalRequest._retry = true;
        try {
          const newToken = await tokenManager.refreshToken();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          tokenManager.handleAuthFailure();
          if (isProd) {
            console.error(
              `[API-CLIENT][${name}][ERR] [ID: ${correlationId}] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Code: ${code}, Status: ${status}`,
            );
          } else {
            console.error(
              `[API-CLIENT][${name}][ERR] [ID: ${correlationId}] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Code: ${code}, Status: ${status} (${duration}ms)`,
              { message: error.message, details: redact(error.response?.data) },
            );
          }
          return Promise.reject(refreshError);
        }
      }

      if (isProd) {
        console.error(
          `[API-CLIENT][${name}][ERR] [ID: ${correlationId}] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Code: ${code}, Status: ${status}`,
        );
      } else {
        console.error(
          `[API-CLIENT][${name}][ERR] [ID: ${correlationId}] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Code: ${code}, Status: ${status} (${duration}ms)`,
          { message: error.message, details: redact(error.response?.data) },
        );
      }

      const apiError = createApiError(error.message, {
        status: error.response?.status,
        code: error.code,
        details: error.response?.data,
        request: originalRequest,
        response: error.response,
      });

      return Promise.reject(apiError);
    },
  );

  const request = async <T>(reqCtx: RequestCtx): Promise<T> => {
    const res = await axiosInstance.request({
      url: reqCtx.url,
      method: reqCtx.method,
      data: reqCtx.data,
      params: reqCtx.params,
      timeout: reqCtx.timeout,
      signal: reqCtx.signal,
    });
    return res.data as T;
  };

  return {
    get: async <T>(url: string, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method'>) => {
      const res = await axiosInstance.get(url, reqConfig);
      return res.data as T;
    },
    post: async <T>(url: string, data?: unknown, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>) => {
      const res = await axiosInstance.post(url, data, reqConfig);
      return res.data as T;
    },
    put: async <T>(url: string, data?: unknown, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>) => {
      const res = await axiosInstance.put(url, data, reqConfig);
      return res.data as T;
    },
    patch: async <T>(url: string, data?: unknown, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>) => {
      const res = await axiosInstance.patch(url, data, reqConfig);
      return res.data as T;
    },
    delete: async <T>(url: string, reqConfig?: Omit<Partial<RequestCtx>, 'url' | 'method'>) => {
      const res = await axiosInstance.delete(url, reqConfig);
      return res.data as T;
    },
    request,
    tokenManager,
  };
};

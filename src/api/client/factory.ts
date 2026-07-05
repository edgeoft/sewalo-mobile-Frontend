import { create } from 'axios';
import { ApiClient, ApiClientConfig, RequestCtx, TokenManager } from './types';
import { createSingleTokenManager } from './auth/singleTokenManager';
import { createSlotTokenManager } from './auth/slotManager';
import { secureStorageAdapter } from './auth/storage';

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

// ponytail: S3 parameter cleaning helper
const cleanPayloadInPlace = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  if (typeof data === 'string') {
    return data.includes('?X-Amz-') || data.includes('?X-Amz-Algorithm') ? data.split('?')[0] : data;
  }
  if (Array.isArray(data)) {
    return data.map(cleanPayloadInPlace);
  }
  if (data.constructor && data.constructor.name === 'FormData') {
    return data;
  }
  for (const key of Object.keys(data)) {
    data[key] = cleanPayloadInPlace(data[key]);
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

export const createApiClient = (
  config: ApiClientConfig,
): ApiClient & {
  tokenManager?: TokenManager;
} => {
  const baseURL = config.baseURL;
  const timeout = config.timeout ?? 10000;

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

    return axiosConfig;
  });

  // Response Interceptor: 401 Refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
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
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  const request = async <T = any>(reqCtx: RequestCtx): Promise<T> => {
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
    get: async <T = any>(url: string, reqConfig?: any) => {
      const res = await axiosInstance.get(url, reqConfig);
      return res.data as T;
    },
    post: async <T = any>(url: string, data?: any, reqConfig?: any) => {
      const res = await axiosInstance.post(url, data, reqConfig);
      return res.data as T;
    },
    put: async <T = any>(url: string, data?: any, reqConfig?: any) => {
      const res = await axiosInstance.put(url, data, reqConfig);
      return res.data as T;
    },
    patch: async <T = any>(url: string, data?: any, reqConfig?: any) => {
      const res = await axiosInstance.patch(url, data, reqConfig);
      return res.data as T;
    },
    delete: async <T = any>(url: string, reqConfig?: any) => {
      const res = await axiosInstance.delete(url, reqConfig);
      return res.data as T;
    },
    request,
    tokenManager,
  };
};

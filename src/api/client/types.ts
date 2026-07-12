export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Params are passed through to axios which accepts any value.
// Response types are strictly typed via generics on ApiClient methods.

export type RequestParams = any;

export interface RequestCtx {
  url: string;
  method: ApiMethod;
  headers?: Record<string, string>;
  params?: RequestParams;
  data?: unknown;
  timeout?: number;
  signal?: AbortSignal;
  tokenSlot?: string;
  cache?: {
    ttl?: number;
    bypass?: boolean;
  };
  correlationId?: string;
  durationMs?: number;
  retryAttempt?: number;
}

export interface ResponseCtx {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  request: RequestCtx;
  durationMs: number;
}

export type Next = (ctx: RequestCtx) => Promise<ResponseCtx>;
export type Interceptor = (ctx: RequestCtx, next: Next) => Promise<ResponseCtx>;
export type Adapter = (request: RequestCtx) => Promise<ResponseCtx>;

export interface ApiError extends Error {
  name: 'ApiError';
  status?: number;
  code?: string;
  details?: unknown;
  request?: RequestCtx;
  response?: ResponseCtx;
}

export const createApiError = (
  message: string,
  params: {
    status?: number;
    code?: string;
    details?: unknown;
    request?: RequestCtx;
    response?: ResponseCtx;
  },
): ApiError => {
  const err = new Error(message);
  return {
    name: 'ApiError',
    message,
    status: params.status,
    code: params.code,
    details: params.details,
    request: params.request,
    response: params.response,
    stack: err.stack,
  };
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type SingleTokenConfig = {
  mode: 'single';
  refreshURL: string;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  onTokenRefreshed: (tokens: Tokens) => void;
  onAuthFailure: () => void;
  proactiveRefreshSeconds?: number;
};

export type TokenSlotConfig = {
  refreshURL: string;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  onTokenRefreshed?: (tokens: Tokens) => void;
  onTokenExpired?: () => void;
  proactiveRefreshSeconds?: number;
};

export type MultiSlotConfig = {
  mode: 'multi';
  defaultSlot: string;
  slots: Record<string, TokenSlotConfig>;
};

export type AuthConfig = SingleTokenConfig | MultiSlotConfig;

export type RetryConfig = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
  retryableStatuses: number[];
  shouldRetry?: (error: ApiError) => boolean;
};

export type CacheConfig = {
  ttl: number;
  keyStrategy?: (req: RequestCtx) => string;
  maxEntries?: number;
};

export type TelemetryHooks = {
  onRequest?: (ctx: RequestCtx) => void;
  onResponse?: (ctx: ResponseCtx) => void;
  onError?: (error: ApiError, ctx: RequestCtx) => void;
  onRetry?: (attempt: number, ctx: RequestCtx) => void;
  onTokenRefreshed?: (slot: string) => void;
  onTokenExpired?: (slot: string) => void;
};

export type MockConfig = {
  enabled: boolean;
  fixtures?: Record<string, unknown>;
};

export type ApiClientConfig = {
  baseURL: string;
  name: string;
  timeout?: number;
  headers?: Record<string, string>;
  env?: 'dev' | 'staging' | 'prod';
  auth?: AuthConfig;
  retry?: RetryConfig;
  cache?: CacheConfig;
  interceptors?: Interceptor[];
  telemetry?: TelemetryHooks;
  mock?: MockConfig;
};

export interface TokenManager {
  baseURL: string;
  getAccessToken: (slot?: string) => Promise<string | null>;
  getRefreshToken: (slot?: string) => Promise<string | null>;
  setTokens: (tokens: Tokens, slot?: string) => Promise<void>;
  clearTokens: (slot?: string) => Promise<void>;
  refreshToken: (slot?: string) => Promise<string | null>;
  canRefresh: (slot?: string) => boolean;
  handleAuthFailure: (slot?: string) => void;
  refreshAll?: () => Promise<void>;
}

export type ApiClient = {
  get: <T>(url: string, config?: Omit<Partial<RequestCtx>, 'url' | 'method'>) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>) => Promise<T>;
  patch: <T>(url: string, data?: unknown, config?: Omit<Partial<RequestCtx>, 'url' | 'method' | 'data'>) => Promise<T>;
  delete: <T>(url: string, config?: Omit<Partial<RequestCtx>, 'url' | 'method'>) => Promise<T>;
  request: <T>(config: RequestCtx) => Promise<T>;
};

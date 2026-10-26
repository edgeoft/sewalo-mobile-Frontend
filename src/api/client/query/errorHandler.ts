import type { ApiError } from '@/api/client/types';

/**
 * Type guard for errors produced by the API client.
 */
export const isApiError = (err: unknown): err is ApiError =>
  typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'ApiError';

/** Safely extracts `missing_fields: string[]` from an ApiError's details payload. */
export const getMissingFields = (details: unknown): string[] | undefined => {
  if (details && typeof details === 'object' && 'missing_fields' in details) {
    const fields = (details as { missing_fields: unknown }).missing_fields;
    if (Array.isArray(fields) && fields.every((f) => typeof f === 'string')) {
      return fields;
    }
  }
  return undefined;
};

export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'Something went wrong. Please try again.';
  if (typeof error === 'string') return error;

  if (isApiError(error)) {
    const details = error.details;

    if (details && typeof details === 'object' && !Array.isArray(details)) {
      const dataObj = details as Record<string, unknown>;

      // 1. Validation error maps (e.g., Laravel errors object)
      if (dataObj.errors && typeof dataObj.errors === 'object') {
        const first = Object.values(dataObj.errors as Record<string, unknown>).find(
          (val) => typeof val === 'string' || (Array.isArray(val) && val.length > 0),
        );
        if (first) {
          return Array.isArray(first) ? String(first[0]) : String(first);
        }
      }

      // 2. Direct message or error string from backend payload
      if (typeof dataObj.message === 'string' && dataObj.message.trim()) {
        return dataObj.message;
      }
      if (typeof dataObj.error === 'string' && dataObj.error.trim()) {
        return dataObj.error;
      }
    }

    // 3. Status-based and message-based defaults
    const msg = error.message;
    if (msg) {
      if (msg === 'Network Error' || msg.includes('NETWORK_ERROR') || msg.includes('Failed to fetch')) {
        return 'Network connection issue. Please check your internet connection.';
      }
      if (msg.includes('timeout') || error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
      }

      const status = error.status;
      if (status === 422) return 'Invalid input data or verification code. Please check and try again.';
      if (status === 401) return 'Session expired. Please sign in again.';
      if (status === 403) return 'Access denied.';
      if (status === 404) return 'The requested resource was not found.';
      if (status === 429) return 'Too many requests. Please try again in a moment.';
      if (status && status >= 500) return 'Server error. Please try again later.';

      if (msg !== 'ApiError') return msg;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export const globalErrorHandler = (error: unknown, type: 'query' | 'mutation', detail: unknown) => {
  const apiError = isApiError(error) ? error : undefined;
  const correlationId = apiError?.request?.correlationId ?? 'N/A';
  const status = apiError?.status ?? 'N/A';
  const code = apiError?.code ?? 'N/A';
  const formattedMessage = extractErrorMessage(error);

  console.error(
    `[GLOBAL-QUERY-ERROR] [Type: ${type}] [ID: ${correlationId}] Status: ${status}, Code: ${code}, Message: ${formattedMessage}`,
    { error, detail },
  );

  // Skip global alerts for 403 (e.g. unverified phone redirects handled locally by hooks)
  if (status === 403) {
    return;
  }

  // Log error globally — individual screens handle their own UI
  console.warn('[GLOBAL-QUERY-ERROR]', formattedMessage);
};

import type { ApiError } from '@/api/client/types';

/**
 * Type guard for errors produced by the API client. Use it to narrow `unknown`
 * values at raw try/catch boundaries; mutation/query hooks already type their
 * errors as ApiError and don't need this guard.
 */
export const isApiError = (err: unknown): err is ApiError =>
  typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'ApiError';

/** Safely extracts `missing_fields: string[]` from an ApiError's details payload. */
export const getMissingFields = (details: unknown): string[] | undefined => {
  if (typeof details === 'object' && details !== null && 'missing_fields' in details) {
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

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    const details = errObj.details;
    const response = errObj.response as Record<string, unknown> | undefined;
    const data = details || response?.data;
    const status = (errObj.status as number | undefined) || (response?.status as number | undefined);

    if (data) {
      if (typeof data === 'string') {
        if (!data.trim().startsWith('<') && !data.includes('Request failed with status code')) {
          return data;
        }
      } else if (typeof data === 'object' && data !== null) {
        const dataObj = data as Record<string, unknown>;

        // 1. Validation error maps (e.g., Laravel errors object)
        if (dataObj.errors && typeof dataObj.errors === 'object' && !Array.isArray(dataObj.errors)) {
          const validationErrors: string[] = [];
          for (const [, value] of Object.entries(dataObj.errors as Record<string, unknown>)) {
            if (Array.isArray(value) && value.length > 0) {
              const msg = String(value[0]);
              if (msg) validationErrors.push(msg);
            } else if (typeof value === 'string' && value.trim()) {
              validationErrors.push(value);
            }
          }
          if (validationErrors.length > 0) {
            return validationErrors.join(' ');
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
    }

    // 3. Handle standard Error.message & Axios defaults
    if (typeof errObj.message === 'string' && errObj.message.trim()) {
      const msg = errObj.message;
      if (msg === 'Network Error' || msg.includes('NETWORK_ERROR') || msg.includes('Failed to fetch')) {
        return 'Network connection issue. Please check your internet connection.';
      }
      if (msg.includes('timeout') || errObj.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
      }

      if (msg.includes('Request failed with status code')) {
        if (status === 422) return 'Invalid input data or verification code. Please check and try again.';
        if (status === 401) return 'Session expired. Please sign in again.';
        if (status === 403) return 'Access denied.';
        if (status === 404) return 'The requested resource was not found.';
        if (status === 429) return 'Too many requests. Please try again in a moment.';
        if (status && status >= 500) return 'Server error. Please try again later.';
        return `Request failed (${status || 'Unknown'}). Please try again.`;
      }

      return msg;
    }
  }

  return 'Something went wrong. Please try again.';
};

export const globalErrorHandler = (error: unknown, type: 'query' | 'mutation', detail: unknown) => {
  const errObj = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};
  const request =
    typeof errObj.request === 'object' && errObj.request !== null ? (errObj.request as Record<string, unknown>) : {};
  const correlationId = (request.correlationId as string) || 'N/A';

  const response =
    typeof errObj.response === 'object' && errObj.response !== null ? (errObj.response as Record<string, unknown>) : {};
  const status = errObj.status || response.status || 'N/A';
  const code = errObj.code || 'N/A';
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

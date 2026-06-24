export const extractErrorMessage = (error: any): string => {
  if (!error) return 'Something went wrong. Please try again.';

  if (typeof error === 'string') return error;

  // 1. Check if it has a nested details/data object (from ApiError/Axios)
  const data = error.details || error.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      // Laravel validation errors (errors is a key-value object of arrays/strings)
      if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        const laravelErrors: string[] = [];
        for (const [key, value] of Object.entries(data.errors)) {
          if (Array.isArray(value)) {
            laravelErrors.push(`${key}: ${value.join(', ')}`);
          } else if (typeof value === 'string') {
            laravelErrors.push(`${key}: ${value}`);
          }
        }
        if (laravelErrors.length > 0) {
          return laravelErrors.join('; ');
        }
      }

      // Laravel general message
      if (typeof data.message === 'string') return data.message;
    }
  }

  // 2. Handle standard Error.message
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  // 3. Fallback to serializing the error object itself
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const globalErrorHandler = (error: any, type: 'query' | 'mutation', detail: any) => {
  const correlationId = error.request?.correlationId || 'N/A';
  const status = error.status || error.response?.status || 'N/A';
  const code = error.code || 'N/A';
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

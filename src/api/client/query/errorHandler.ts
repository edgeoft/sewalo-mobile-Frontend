export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'Something went wrong. Please try again.';

  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const details = errObj.details;
    const response = errObj.response as Record<string, unknown> | undefined;
    const data = details || response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data === 'object' && data !== null) {
        const dataObj = data as Record<string, unknown>;
        // Laravel validation errors (errors is a key-value object of arrays/strings)
        if (dataObj.errors && typeof dataObj.errors === 'object' && !Array.isArray(dataObj.errors)) {
          const laravelErrors: string[] = [];
          for (const [key, value] of Object.entries(dataObj.errors as Record<string, unknown>)) {
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
        if (typeof dataObj.message === 'string') return dataObj.message;
      }
    }

    // 2. Handle standard Error.message
    if (typeof errObj.message === 'string') {
      return errObj.message;
    }
  }

  // 3. Fallback to serializing the error object itself
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
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

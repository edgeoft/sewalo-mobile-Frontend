import { Alert } from 'react-native';

export const globalErrorHandler = (error: any, type: 'query' | 'mutation', detail?: any) => {
  const correlationId = error.request?.correlationId || 'N/A';
  const status = error.status || error.response?.status || 'N/A';
  const code = error.code || 'N/A';

  console.error(
    `[GLOBAL-QUERY-ERROR] [Type: ${type}] [ID: ${correlationId}] Status: ${status}, Code: ${code}, Message: ${error.message || error}`,
    { detail },
  );

  // Skip global alerts for 403 (e.g. unverified phone redirects handled locally by hooks)
  if (status === 403) {
    return;
  }

  // Display user-friendly alert dialog
  const userMessage = error.message || 'Something went wrong. Please try again.';
  Alert.alert('Error', userMessage);
};

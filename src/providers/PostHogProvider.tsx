import React from 'react';
import { PostHogProvider as PHProvider } from 'posthog-react-native';
import { ENV } from '@/constants/env';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  if (!ENV.POSTHOG_API_KEY) {
    // If PostHog key is not configured, pass children directly
    // so it doesn't crash or attempt initialization with empty key.
    return <>{children}</>;
  }

  return (
    <PHProvider
      apiKey={ENV.POSTHOG_API_KEY}
      options={{
        host: ENV.POSTHOG_HOST,
      }}
    >
      {children}
    </PHProvider>
  );
}

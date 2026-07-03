import React from 'react';
import { PostHogProvider as PHProvider } from 'posthog-react-native';
import { ENV } from '@/constants/env';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const isProduction = ENV.APP_ENV === 'production';
  const apiKey = ENV.POSTHOG_API_KEY || 'disabled-key-placeholder';

  return (
    <PHProvider
      apiKey={apiKey}
      options={{
        host: ENV.POSTHOG_HOST || 'https://us.i.posthog.com',
        disabled: !isProduction || !ENV.POSTHOG_API_KEY,
      }}
    >
      {children}
    </PHProvider>
  );
}

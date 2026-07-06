import { ENV } from '@/constants/env';
import { PostHogProvider as PHProvider } from 'posthog-react-native';
import React from 'react';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const apiKey = ENV.POSTHOG_PROJECT_TOKEN || 'disabled-key-placeholder';

  return (
    <PHProvider
      apiKey={apiKey}
      options={{
        host: ENV.POSTHOG_HOST || 'https://us.i.posthog.com',
        disabled: !ENV.POSTHOG_PROJECT_TOKEN,
      }}
    >
      {children}
    </PHProvider>
  );
}

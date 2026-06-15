import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { FontProvider } from '@/providers/FontProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { queryClient } from '@/api/query/queryClient';

import '../global.css';
import '../i18n';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FontProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#07111f',
              },
            }}
          />
        </FontProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

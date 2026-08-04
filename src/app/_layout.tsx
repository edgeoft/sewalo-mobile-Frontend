import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { StatusBar } from 'expo-status-bar';

import { FontProvider } from '@/providers/FontProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { queryClient } from '@/api/client/query/queryClient';
import { useNotificationObserver } from '@/services/NotificationService';
import { SnackbarProvider } from '@/components/ui/Snackbar';
import { ErrorDialogProvider } from '@/components/ui/ErrorDialog';

import '../global.css';
import '../i18n';

export default function RootLayout() {
  useNotificationObserver();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <PostHogProvider>
        <SnackbarProvider>
          <ErrorDialogProvider>
            <FontProvider>
              <AuthProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: {
                      backgroundColor: '#07111f',
                    },
                  }}
                />
              </AuthProvider>
            </FontProvider>
          </ErrorDialogProvider>
        </SnackbarProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}

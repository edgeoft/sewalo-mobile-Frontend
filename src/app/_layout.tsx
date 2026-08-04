import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';

import { queryClient } from '@/api/client/query/queryClient';
import { ErrorDialogProvider } from '@/components/ui/ErrorDialog';
import { SnackbarProvider } from '@/components/ui/Snackbar';
import { AuthProvider } from '@/providers/AuthProvider';
import { FontProvider } from '@/providers/FontProvider';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { useNotificationObserver } from '@/services/NotificationService';

import '../global.css';
import '../i18n';

export default function RootLayout() {
  useNotificationObserver();

  return (
    <SafeAreaProvider>
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
                        backgroundColor: '#f1f5f9',
                      },
                    }}
                  />
                </AuthProvider>
              </FontProvider>
            </ErrorDialogProvider>
          </SnackbarProvider>
        </PostHogProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

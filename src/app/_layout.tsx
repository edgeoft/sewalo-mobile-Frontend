import { Stack } from 'expo-router';

import { FontProvider } from '@/providers/FontProvider';

import '../global.css';
import '../i18n';

export default function RootLayout() {
  return (
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
  );
}

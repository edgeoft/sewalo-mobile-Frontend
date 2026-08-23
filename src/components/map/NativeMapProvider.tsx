import { usePostHog } from 'posthog-react-native';
import { THEME_COLORS } from '@/constants/colors';
import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ENV } from '@/constants/env';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import type { MapProviderProps } from './types';

const GoogleMapsSelector = lazy(() => import('./GoogleMapsSelector'));
const OpenStreetMapSelector = lazy(() => import('./OpenStreetMapSelector'));

function MapLoader() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <ActivityIndicator size="large" color={THEME_COLORS.primary} />
    </View>
  );
}

export default function NativeMapProvider(props: MapProviderProps) {
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;
  const posthog = usePostHog();

  const isGoogleMapsFlagEnabled = posthog?.isFeatureEnabled(FEATURE_FLAGS.GoogleMaps);

  // Only use Google Maps if the flag is explicitly enabled and API key is present
  const useGoogleMaps = isGoogleMapsFlagEnabled && !!apiKey;

  return (
    <Suspense fallback={<MapLoader />}>
      {useGoogleMaps ? <GoogleMapsSelector {...props} /> : <OpenStreetMapSelector {...props} />}
    </Suspense>
  );
}

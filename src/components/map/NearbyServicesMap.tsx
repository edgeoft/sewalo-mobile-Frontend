import { usePostHog } from 'posthog-react-native';
import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ENV } from '@/constants/env';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import type { NearbyServicesMapProps } from './OSMNearbyServicesMap';

const GoogleNearbyServicesMap = lazy(() => import('./GoogleNearbyServicesMap'));
const OSMNearbyServicesMap = lazy(() => import('./OSMNearbyServicesMap'));

function MapLoader() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <ActivityIndicator size="large" color="#485aff" />
    </View>
  );
}

export default function NearbyServicesMap(props: NearbyServicesMapProps) {
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;
  const posthog = usePostHog();

  const isGoogleMapsFlagEnabled = posthog?.isFeatureEnabled(FEATURE_FLAGS.GoogleMaps);

  // Only use Google Maps if the flag is explicitly enabled and API key is present
  const useGoogleMaps = isGoogleMapsFlagEnabled && !!apiKey;

  return (
    <Suspense fallback={<MapLoader />}>
      {useGoogleMaps ? <GoogleNearbyServicesMap {...props} /> : <OSMNearbyServicesMap {...props} />}
    </Suspense>
  );
}

import { usePostHog } from 'posthog-react-native';
import React from 'react';
import { ENV } from '@/constants/env';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import GoogleNearbyServicesMap from './GoogleNearbyServicesMap';
import OSMNearbyServicesMap, { NearbyServicesMapProps } from './OSMNearbyServicesMap';

export default function NearbyServicesMap(props: NearbyServicesMapProps) {
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;
  const posthog = usePostHog();

  const isGoogleMapsFlagEnabled = posthog.isFeatureEnabled(FEATURE_FLAGS.GoogleMaps);

  // Only use Google Maps if the flag is explicitly enabled and API key is present
  const useGoogleMaps = isGoogleMapsFlagEnabled && !!apiKey;

  if (useGoogleMaps) {
    return <GoogleNearbyServicesMap {...props} />;
  }

  return <OSMNearbyServicesMap {...props} />;
}

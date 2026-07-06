import { usePostHog } from 'posthog-react-native';
import React from 'react';
import { ENV } from '@/constants/env';
import type { MapProviderProps } from './types';
import GoogleMapsSelector from './GoogleMapsSelector';
import OpenStreetMapSelector from './OpenStreetMapSelector';

export default function NativeMapProvider(props: MapProviderProps) {
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;
  const posthog = usePostHog();

  const isGoogleMapsFlagEnabled = posthog.isFeatureEnabled('google-maps');

  // Only use Google Maps if the flag is explicitly enabled and API key is present
  const useGoogleMaps = isGoogleMapsFlagEnabled && !!apiKey;

  if (useGoogleMaps) {
    return <GoogleMapsSelector {...props} />;
  }

  return <OpenStreetMapSelector {...props} />;
}

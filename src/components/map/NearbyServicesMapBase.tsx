import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type WebViewMessageEvent } from 'react-native-webview';

import type { MapViewport } from '@/types';
import { getImageUrl } from '@/utils/image';

import { SharedWebViewMap } from './SharedWebViewMap';
import type { MapMarkerPayload, NearbyServicesMapProps } from './types';

export interface NearbyServicesMapBaseProps extends NearbyServicesMapProps {
  /** Builds the provider-specific map HTML. Called once per initial region change. */
  generateHtml: (safeLat: number, safeLng: number) => string;
  /** Label used in console warnings for message-parse failures. */
  label?: string;
}

/**
 * Shared wrapper for the nearby-services WebView maps (Google / OSM).
 * Owns the marker payload mapping, postMessage bridge, and selection events;
 * provider twins only supply the HTML generator.
 */
export default function NearbyServicesMapBase({
  userLat,
  userLng,
  providers,
  selectedProviderId,
  onSelectProvider,
  onMapCenterChange,
  onMapViewportChange,
  generateHtml,
  label = 'MapWebView',
}: NearbyServicesMapBaseProps) {
  const webViewRef = useRef<React.ElementRef<typeof SharedWebViewMap>>(null);

  // Coordinates are required numbers; only guard against NaN.
  const safeLat = Number.isFinite(userLat) ? userLat : 27.700769;
  const safeLng = Number.isFinite(userLng) ? userLng : 85.30014;

  const markersPayload = useMemo(
    () =>
      providers.map((p): MapMarkerPayload => {
        const lat = p.coordinates?.lat ?? safeLat;
        const lng = p.coordinates?.lng ?? safeLng;
        return {
          id: p.id,
          name: p.name,
          avatar: getImageUrl(p.avatar) || 'https://avatar.iran.liara.run/public',
          rating: p.avg_rating.toFixed(1),
          lat,
          lng,
        };
      }),
    [providers, safeLat, safeLng],
  );

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'updateData',
        providers: markersPayload,
        selectedId: selectedProviderId,
      }),
    );
  }, [markersPayload, selectedProviderId]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'providerSelected') {
          onSelectProvider(data.id);
        } else if (data.type === 'mapMoved') {
          if (data.center) {
            onMapCenterChange?.(data.center.lat, data.center.lng);
            onMapViewportChange?.({
              center: data.center as { lat: number; lng: number },
              bounds: data.bounds as MapViewport['bounds'],
              zoom: data.zoom as number | undefined,
            });
          } else if (typeof data.lat === 'number' && typeof data.lng === 'number') {
            onMapCenterChange?.(data.lat, data.lng);
            onMapViewportChange?.({
              center: { lat: data.lat, lng: data.lng },
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to parse message from ${label}:`, err);
      }
    },
    [onSelectProvider, onMapCenterChange, onMapViewportChange, label],
  );

  const mapHtml = useMemo(() => generateHtml(safeLat, safeLng), [generateHtml, safeLat, safeLng]);

  return <SharedWebViewMap ref={webViewRef} html={mapHtml} onMessage={onMessage} />;
}

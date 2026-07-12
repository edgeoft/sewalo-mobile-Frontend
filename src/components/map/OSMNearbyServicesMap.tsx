import { useRef, useEffect, useMemo } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { NearbyProvider } from '@/types';
import { getImageUrl } from '@/utils/image';
import { SharedWebViewMap } from './SharedWebViewMap';
import { CARTODB_VOYAGER_URL, CARTODB_ATTRIBUTION, MAP_CONSOLE_BRIDGE, safeJsonStringify } from './mapShared';

export interface NearbyServicesMapProps {
  userLat: number;
  userLng: number;
  providers: NearbyProvider[];
  selectedProviderId: string | null;
  onSelectProvider: (providerId: string | null) => void;
  onMapCenterChange?: (lat: number, lng: number) => void;
}

function generateOSMNearbyMapHTML(userLat: number, userLng: number, providersData: any[]) {
  const safeJson = safeJsonStringify(providersData);

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  ${MAP_CONSOLE_BRIDGE}
</script>
<script>
  var map = L.map('map', {
    center: [${userLat}, ${userLng}],
    zoom: 14,
    zoomControl: false
  });

  L.tileLayer('${CARTODB_VOYAGER_URL}', {
    maxZoom: 19,
    attribution: '${CARTODB_ATTRIBUTION}'
  }).addTo(map);

  // User location marker
  var userIcon = L.divIcon({
    html: '<div style="background-color: #485aff; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(72,90,255,0.6);"></div>',
    className: 'user-pin-icon',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
  L.marker([${userLat}, ${userLng}], { icon: userIcon }).addTo(map);

  // Post messages when map dragging/zooming completes
  map.on('moveend', function() {
    var center = map.getCenter();
    sendMessage('mapMoved', { lat: center.lat, lng: center.lng });
  });

  var markers = {};
  var markersData = ${safeJson};

  function sendMessage(type, data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, data)));
    }
  }

  // Custom provider icon with round avatar and rating badge
  function createProviderIcon(avatarUrl, rating, isSelected) {
    var color = isSelected ? '#ef4444' : '#485aff';
    var shadow = isSelected ? '0 4px 10px rgba(239,68,68,0.5)' : '0 2px 6px rgba(0,0,0,0.3)';
    var size = isSelected ? '46px' : '40px';
    var imgSize = isSelected ? '40px' : '34px';
    var borderSize = isSelected ? '3px' : '3px';
    var marginOffset = isSelected ? '-6px' : '-5px';
    
    return L.divIcon({
      html: '<div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 60px; height: 70px;">' +
              '<!-- Circular Avatar -->' +
              '<div style="width: ' + size + '; height: ' + size + '; border-radius: 50%; border: ' + borderSize + ' solid ' + color + '; overflow: hidden; background-color: white; box-shadow: ' + shadow + '; display: flex; align-items: center; justify-content: center;">' +
                '<img src="' + avatarUrl + '" style="width: ' + imgSize + '; height: ' + imgSize + '; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src=\\\'https://avatar.iran.liara.run/public\\\';"/>' +
              '</div>' +
              '<!-- Rating Badge -->' +
              '<div style="background-color: ' + color + '; color: white; padding: 2px 6px; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 9px; font-weight: 700; margin-top: ' + marginOffset + '; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap;">' +
                '★ ' + rating +
              '</div>' +
            '</div>',
      className: 'provider-pin-icon-' + (isSelected ? 'selected' : 'normal'),
      iconSize: [60, 70],
      iconAnchor: [30, 60]
    });
  }

  function renderMarkers(selectedId) {
    if (typeof map === 'undefined' || !map) return;
    map.invalidateSize();
    
    // Clear existing
    for (var id in markers) {
      map.removeLayer(markers[id]);
    }
    markers = {};

    markersData.forEach(function(p) {
      if (typeof p.lat !== 'number' || isNaN(p.lat) || typeof p.lng !== 'number' || isNaN(p.lng)) {
        return; // Skip invalid coordinates
      }
      var isSelected = p.id === selectedId;
      var icon = createProviderIcon(p.avatar, p.rating, isSelected);
      var m = L.marker([p.lat, p.lng], { icon: icon }).addTo(map);
      
      m.on('click', function() {
        sendMessage('providerSelected', { id: p.id });
      });
      
      markers[p.id] = m;
      
      if (isSelected) {
        map.panTo([p.lat, p.lng]);
      }
    });
  }

  // Render markers initially
  renderMarkers(null);

  // Force map reflow/invalidation
  setTimeout(function() {
    if (map) {
      map.invalidateSize();
    }
  }, 200);

  // Message listeners
  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setSelected') {
        renderMarkers(msg.id);
      } else if (msg.type === 'updateData') {
        markersData = msg.providers;
        renderMarkers(msg.selectedId);
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });

  document.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setSelected') {
        renderMarkers(msg.id);
      } else if (msg.type === 'updateData') {
        markersData = msg.providers;
        renderMarkers(msg.selectedId);
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });
</script>
</body>
</html>`;
}

export default function OSMNearbyServicesMap({
  userLat,
  userLng,
  providers,
  selectedProviderId,
  onSelectProvider,
  onMapCenterChange,
}: NearbyServicesMapProps) {
  const webViewRef = useRef<WebView>(null);

  const safeLat = typeof userLat === 'number' && !isNaN(userLat) ? userLat : 27.700769;
  const safeLng = typeof userLng === 'number' && !isNaN(userLng) ? userLng : 85.30014;

  const markersPayload = useMemo(() => {
    return providers.map((p) => {
      const lat = p.coordinates?.lat ?? safeLat;
      const lng = p.coordinates?.lng ?? safeLng;
      return {
        id: p.id,
        name: p.name,
        avatar: getImageUrl(p.avatar) || 'https://avatar.iran.liara.run/public',
        rating: typeof p.avg_rating === 'number' ? p.avg_rating.toFixed(1) : '0.0',
        lat,
        lng,
      };
    });
  }, [providers, safeLat, safeLng]);

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'updateData',
        providers: markersPayload,
        selectedId: selectedProviderId,
      }),
    );
  }, [markersPayload, selectedProviderId]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'providerSelected') {
        onSelectProvider(data.id);
      } else if (data.type === 'mapMoved') {
        onMapCenterChange?.(data.lat, data.lng);
      }
    } catch (err) {
      console.warn('Failed to parse message from OSMWebView:', err);
    }
  };

  return (
    <SharedWebViewMap
      ref={webViewRef}
      html={generateOSMNearbyMapHTML(safeLat, safeLng, markersPayload)}
      onMessage={onMessage}
    />
  );
}

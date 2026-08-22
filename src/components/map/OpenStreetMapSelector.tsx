import { useCallback, useMemo } from 'react';

import LocationSelectorShell from './LocationSelectorShell';
import type { MapGeocoderAdapter } from './useMapLocationSelector';
import type { MapProviderProps, SearchResult } from './types';
import { CARTODB_VOYAGER_URL, CARTODB_ATTRIBUTION, MAP_CONSOLE_BRIDGE } from './mapShared';

function generateOSMMapHTML(lat: number, lng: number) {
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
    center: [${lat}, ${lng}],
    zoom: 16,
    zoomControl: false
  });

  L.tileLayer('${CARTODB_VOYAGER_URL}', {
    maxZoom: 19,
    attribution: '${CARTODB_ATTRIBUTION}'
  }).addTo(map);

  // Use inline SVG DivIcon to guarantee marker renders correctly offline/online without default Leaflet asset path errors
  var customIcon = L.divIcon({
    html: '<svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0ZM15 20.25C12.1005 20.25 9.75 17.8995 9.75 15C9.75 12.1005 12.1005 9.75 15 9.75C17.8995 9.75 20.25 12.1005 20.25 15C20.25 17.8995 17.8995 20.25 15 20.25Z" fill="#485aff"/></svg>',
    className: 'custom-pin-icon',
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  var marker = L.marker([${lat}, ${lng}], { draggable: true, icon: customIcon }).addTo(map);

  function sendMessage(type, data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
    }
  }

  // pan map to center on new coordinates for better UX
  marker.on('dragend', function(e) {
    var pos = marker.getLatLng();
    map.panTo(pos);
    sendMessage('coordinateChanged', { latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) });
  });

  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    map.panTo(e.latlng);
    sendMessage('coordinateChanged', { latitude: e.latlng.lat.toFixed(6), longitude: e.latlng.lng.toFixed(6) });
  });

  window.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'setMarker') {
        var ll = L.latLng(parseFloat(msg.lat), parseFloat(msg.lng));
        marker.setLatLng(ll);
        map.setView(ll, map.getZoom());
        map.invalidateSize();
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });

  // Force map reflow/invalidation to handle layout sizing issues in webviews
  setTimeout(function() {
    if (map) {
      map.invalidateSize();
    }
  }, 200);
</script>
</body>
</html>`;
}

const NOMINATIM_HEADERS = {
  'User-Agent': 'SewaloApp/1.0',
  'Accept-Language': 'ne,en',
} as const;

const createNominatimGeocoder = (): MapGeocoderAdapter => ({
  reverseGeocode: async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { ...NOMINATIM_HEADERS } },
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.display_name) {
      return data.display_name as string;
    }
    return null;
  },

  forwardGeocode: async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=np&limit=1`,
      { headers: { ...NOMINATIM_HEADERS } },
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  },

  autocomplete: async (query) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=np&limit=5`,
      { headers: { ...NOMINATIM_HEADERS } },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { display_name: string; lat: string; lon: string }[];
    return data.map((item) => ({
      description: item.display_name,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
    })) as SearchResult[];
  },

  resolveCityStateCountry: async (lat, lng) => {
    let city = '';
    let state = '';
    let country = '';
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { ...NOMINATIM_HEADERS } },
    );
    if (response.ok) {
      const data = await response.json();
      const address = data.address || {};
      city = address.city || address.town || address.village || address.suburb || '';
      state = address.state || address.region || '';
      country = address.country || '';
    }
    return { city, state, country };
  },
});

export default function OpenStreetMapSelector(props: MapProviderProps) {
  const generateHtml = useCallback((lat: number, lng: number) => generateOSMMapHTML(lat, lng), []);

  const geocoder = useMemo(() => createNominatimGeocoder(), []);

  return <LocationSelectorShell {...props} generateHtml={generateHtml} geocoder={geocoder} />;
}

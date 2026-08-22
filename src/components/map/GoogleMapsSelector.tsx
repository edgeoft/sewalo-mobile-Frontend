import { useCallback, useMemo } from 'react';

import { ENV } from '@/constants/env';
import LocationSelectorShell from './LocationSelectorShell';
import type { MapGeocoderAdapter } from './useMapLocationSelector';
import type { MapProviderProps, SearchResult } from './types';
import { MAP_CONSOLE_BRIDGE } from './mapShared';

function generateGoogleMapHTML(lat: number, lng: number, apiKey: string) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
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
  var map;
  var marker;

  function sendMessage(type, data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
    }
  }

  function initMap() {
    var initialPos = { lat: ${lat}, lng: ${lng} };
    map = new google.maps.Map(document.getElementById('map'), {
      center: initialPos,
      zoom: 16,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
    });

    marker = new google.maps.Marker({
      position: initialPos,
      map: map,
      draggable: true
    });

    marker.addListener('dragend', function() {
      var pos = marker.getPosition();
      sendMessage('coordinateChanged', { latitude: pos.lat().toFixed(6), longitude: pos.lng().toFixed(6) });
    });

    map.addListener('click', function(e) {
      var pos = e.latLng;
      marker.setPosition(pos);
      sendMessage('coordinateChanged', { latitude: pos.lat().toFixed(6), longitude: pos.lng().toFixed(6) });
    });
  }

  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setMarker') {
        var pos = { lat: parseFloat(msg.lat), lng: parseFloat(msg.lng) };
        marker.setPosition(pos);
        map.setCenter(pos);
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body>
</html>`;
}

interface GoogleAddressComponent {
  types: string[];
  long_name: string;
  short_name: string;
}

const extractComponent = (components: GoogleAddressComponent[], types: string[]): string => {
  for (const type of types) {
    const comp = components.find((c) => c.types.includes(type));
    if (comp) {
      return comp.long_name;
    }
  }
  return '';
};

const GOOGLE_GEO_LANGUAGE = 'language=ne,en';

const createGoogleGeocoder = (apiKey: string): MapGeocoderAdapter => ({
  reverseGeocode: async (lat, lng) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&${GOOGLE_GEO_LANGUAGE}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address as string;
    }
    return null;
  },

  forwardGeocode: async (address) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&${GOOGLE_GEO_LANGUAGE}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  },

  autocomplete: async (query) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&components=country:np&${GOOGLE_GEO_LANGUAGE}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.predictions || []) as SearchResult[];
  },

  resolveSelection: async (result) => {
    if (!result.place_id) return null;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,formatted_address&key=${apiKey}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    const details = data.result;
    if (details && details.geometry && details.geometry.location) {
      return {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
        address: details.formatted_address || result.description,
      };
    }
    return null;
  },

  resolveCityStateCountry: async (lat, lng) => {
    let city = '';
    let state = '';
    let country = '';
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&${GOOGLE_GEO_LANGUAGE}`,
    );
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const components = (data.results[0].address_components || []) as GoogleAddressComponent[];
        city = extractComponent(components, ['locality', 'sublocality', 'postal_town', 'administrative_area_level_2']);
        state = extractComponent(components, ['administrative_area_level_1']);
        country = extractComponent(components, ['country']);
      }
    }
    return { city, state, country };
  },
});

export default function GoogleMapsSelector(props: MapProviderProps) {
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;

  const generateHtml = useCallback((lat: number, lng: number) => generateGoogleMapHTML(lat, lng, apiKey), [apiKey]);

  const geocoder = useMemo(() => createGoogleGeocoder(apiKey), [apiKey]);

  return <LocationSelectorShell {...props} generateHtml={generateHtml} geocoder={geocoder} />;
}

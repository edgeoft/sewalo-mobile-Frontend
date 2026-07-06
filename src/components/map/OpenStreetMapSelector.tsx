import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { MapProviderProps, SearchResult } from './types';

function generateOSMMapHTML(lat: number, lng: number) {
  return `
<!DOCTYPE html>
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
  var map = L.map('map', {
    center: [${lat}, ${lng}],
    zoom: 16,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OSM'
  }).addTo(map);

  // ponytail: Use inline SVG DivIcon to guarantee marker renders correctly offline/online without default Leaflet asset path errors
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

  // ponytail: pan map to center on new coordinates for better UX
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
      }
    } catch(err) {}
  });

  document.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'setMarker') {
        var ll = L.latLng(parseFloat(msg.lat), parseFloat(msg.lng));
        marker.setLatLng(ll);
        map.setView(ll, map.getZoom());
      }
    } catch(err) {}
  });
</script>
</body>
</html>`;
}

export default function OpenStreetMapSelector({
  initialLat = 27.700769,
  initialLng = 85.30014,
  coordinates,
  initialAddress = '',
  onSelectLocation,
  onCancel,
}: MapProviderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const startLat = coordinates?.lat || initialLat;
  const startLng = coordinates?.lng || initialLng;

  const [coordinate, setCoordinate] = useState({ latitude: startLat, longitude: startLng });

  const [prevLat, setPrevLat] = useState(startLat);
  const [prevLng, setPrevLng] = useState(startLng);
  if (startLat !== prevLat || startLng !== prevLng) {
    setPrevLat(startLat);
    setPrevLng(startLng);
    setCoordinate({ latitude: startLat, longitude: startLng });
  }

  const [addressText, setAddressText] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fallbackAddress = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  // Reverse Geocoding Implementation
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    let resolvedAddress: string | null = null;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SewaloApp/1.0',
            'Accept-Language': 'ne,en',
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          resolvedAddress = data.display_name;
        }
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
    }
    setAddressText(resolvedAddress || fallbackAddress(lat, lng));
    setIsReverseGeocoding(false);
  }, []);

  // Initial geocoding on mount
  useEffect(() => {
    if (!initialAddress) {
      const fetchInitial = async () => {
        setIsReverseGeocoding(true);
        let initialResolvedAddress: string | null = null;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${initialLat}&lon=${initialLng}&zoom=16&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'SewaloApp/1.0',
                'Accept-Language': 'ne,en',
              },
            },
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              initialResolvedAddress = data.display_name;
            }
          }
        } catch (err) {
          console.warn('Initial reverse geocode failed:', err);
        }
        setAddressText(initialResolvedAddress || fallbackAddress(initialLat, initialLng));
        setIsReverseGeocoding(false);
      };
      fetchInitial();
    }
  }, [initialAddress, initialLat, initialLng]);

  // Sync WebView marker location when parent coordinates change (e.g. during edits)
  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'setMarker', lat: startLat.toString(), lng: startLng.toString() }),
    );
  }, [startLat, startLng]);

  // Forward geocode initialAddress on mount to ensure marker and map are positioned on the saved address coordinates
  useEffect(() => {
    if (initialAddress) {
      const geocodeInitial = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(initialAddress)}&countrycodes=np&limit=1`,
            {
              headers: {
                'User-Agent': 'SewaloApp/1.0',
                'Accept-Language': 'ne,en',
              },
            },
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              setCoordinate({ latitude: lat, longitude: lng });
              webViewRef.current?.postMessage(
                JSON.stringify({ type: 'setMarker', lat: lat.toString(), lng: lng.toString() }),
              );
            }
          }
        } catch (err) {
          console.warn('Geocoding initial address failed:', err);
        }
      };
      geocodeInitial();
    }
  }, [initialAddress]);

  // Search Address autocomplete
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (text.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=np&limit=5`,
          {
            headers: {
              'User-Agent': 'SewaloApp/1.0',
              'Accept-Language': 'ne,en',
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          const results = data.map((item: any) => ({
            description: item.display_name,
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
          }));
          setSearchResults(results);
        }
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  // Select Address search result
  const handleSelectResult = async (result: SearchResult) => {
    setIsSearching(true);
    try {
      if (!result.lat || !result.lon) return;
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const formattedAddress = result.display_name || result.description;

      setSearchQuery('');
      setSearchResults([]);
      setCoordinate({ latitude: lat, longitude: lng });
      setAddressText(formattedAddress);
      webViewRef.current?.postMessage(JSON.stringify({ type: 'setMarker', lat: lat.toString(), lng: lng.toString() }));
    } catch (err) {
      console.warn('Place details fetch failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'coordinateChanged') {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        setCoordinate({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng);
      } else if (data.type === 'log') {
        console.log('WebView Console:', data.message);
      }
    } catch (err) {
      console.warn('WebView message parse failed:', err);
    }
  };

  // Confirm Location selection
  const handleConfirm = async () => {
    let finalCity = '';
    let finalState = '';
    let finalCountry = '';

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SewaloApp/1.0',
            'Accept-Language': 'ne,en',
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        finalCity = address.city || address.town || address.village || address.suburb || '';
        finalState = address.state || address.region || '';
        finalCountry = address.country || '';
      }
    } catch (err) {
      console.warn('Reverse geocode on confirm failed:', err);
    }

    const cleanStr = (val: string, fallback: string) => {
      if (!val || val.trim() === '' || val.toLowerCase() === 'n/a' || val === t('common.na')) {
        return fallback;
      }
      return val;
    };

    finalCity = cleanStr(finalCity, '');
    finalState = cleanStr(finalState, '');
    finalCountry = cleanStr(finalCountry, '');

    const resolvedAddress =
      addressText ||
      searchQuery ||
      [finalCity, finalState, finalCountry].filter(Boolean).join(', ') ||
      fallbackAddress(coordinate.latitude, coordinate.longitude);

    await onSelectLocation({
      address: resolvedAddress,
      lat: coordinate.latitude,
      lng: coordinate.longitude,
      coordinates: {
        lat: coordinate.latitude,
        lng: coordinate.longitude,
      },
      city: finalCity,
      state: finalState,
      country: finalCountry,
    });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      onPress={() => handleSelectResult(item)}
      className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
    >
      <Feather name="map-pin" size={14} color="#94a3b8" />
      <Text className="text-sm text-gray-700 flex-1 ml-2" numberOfLines={1}>
        {item.description}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View
        className="bg-white border-b border-gray-200 px-4 pb-3 z-10"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="relative">
          <Input
            placeholder={t('components.searchAddress')}
            value={searchQuery}
            onChangeText={handleSearchChange}
            rightIcon={
              isSearching ? (
                <ActivityIndicator size="small" color="#485aff" />
              ) : (
                <Feather name="search" size={16} color="#94a3b8" />
              )
            }
            inputClassName="text-sm pr-10"
            className="mb-0"
          />
        </View>

        <Text className="text-xs text-gray-500 mt-1.5 leading-4">
          {isReverseGeocoding ? (
            <Text className="text-primary">{t('components.resolvingLocation')}</Text>
          ) : (
            t('components.selectedLocation', { address: addressText || t('components.dragMarker') })
          )}
        </Text>
      </View>

      <View className="flex-1 relative">
        <WebView
          ref={webViewRef}
          source={{
            html: generateOSMMapHTML(initialLat, initialLng),
          }}
          style={styles.map}
          onMessage={handleMessage}
          onLoadEnd={() => {
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: 'setMarker',
                lat: coordinate.latitude.toString(),
                lng: coordinate.longitude.toString(),
              }),
            );
          }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
        />

        {searchResults.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(_, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <View
        className="flex-row px-4 bg-white border-t border-gray-200 gap-3"
        style={{ paddingTop: 16, paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button
          title={t('common.cancel')}
          variant="light"
          onPress={onCancel}
          className="flex-1 border border-gray-200"
          textClassName="text-gray-700"
        />
        <Button
          title={t('components.confirmLocation')}
          variant="primary"
          onPress={handleConfirm}
          disabled={isReverseGeocoding}
          loading={isReverseGeocoding}
          className="flex-1"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFill,
  },
  dropdown: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 0,
    zIndex: 1001,
  },
});

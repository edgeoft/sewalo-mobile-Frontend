import { Feather } from '@expo/vector-icons';
import { ENV } from '@/constants/env';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { MapProviderProps, SearchResult } from './types';
import { SharedWebViewMap } from './SharedWebViewMap';
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

export default function GoogleMapsSelector({
  initialLat = 27.700769,
  initialLng = 85.30014,
  coordinates,
  initialAddress = '',
  onSelectLocation,
  onCancel,
}: MapProviderProps) {
  const { t } = useTranslation();
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;
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
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseGeocoding(true);
      let resolvedAddress: string | null = null;
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ne,en`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            resolvedAddress = data.results[0].formatted_address;
          }
        }
      } catch (err) {
        console.warn('Reverse geocode failed:', err);
      }
      setAddressText(resolvedAddress || fallbackAddress(lat, lng));
      setIsReverseGeocoding(false);
    },
    [apiKey],
  );

  // Initial geocoding on mount
  useEffect(() => {
    if (!initialAddress) {
      const fetchInitial = async () => {
        setIsReverseGeocoding(true);
        let initialResolvedAddress: string | null = null;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${initialLat},${initialLng}&key=${apiKey}&language=ne,en`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              initialResolvedAddress = data.results[0].formatted_address;
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
  }, [initialAddress, initialLat, initialLng, apiKey]);

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
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(initialAddress)}&key=${apiKey}&language=ne,en`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const loc = data.results[0].geometry.location;
              setCoordinate({ latitude: loc.lat, longitude: loc.lng });
              webViewRef.current?.postMessage(
                JSON.stringify({ type: 'setMarker', lat: loc.lat.toString(), lng: loc.lng.toString() }),
              );
            }
          }
        } catch (err) {
          console.warn('Geocoding initial address failed:', err);
        }
      };
      geocodeInitial();
    }
  }, [initialAddress, apiKey]);

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
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${apiKey}&components=country:np&language=ne,en`,
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.predictions || []);
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
      if (!result.place_id) return;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry,formatted_address&key=${apiKey}`,
      );
      if (response.ok) {
        const data = await response.json();
        const details = data.result;
        if (details && details.geometry && details.geometry.location) {
          const lat = details.geometry.location.lat;
          const lng = details.geometry.location.lng;
          const formattedAddress = details.formatted_address || result.description;

          setSearchQuery('');
          setSearchResults([]);
          setCoordinate({ latitude: lat, longitude: lng });
          setAddressText(formattedAddress);
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'setMarker', lat: lat.toString(), lng: lng.toString() }),
          );
        }
      }
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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${apiKey}&language=ne,en`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const components = data.results[0].address_components || [];
          finalCity = extractComponent(components, [
            'locality',
            'sublocality',
            'postal_town',
            'administrative_area_level_2',
          ]);
          finalState = extractComponent(components, ['administrative_area_level_1']);
          finalCountry = extractComponent(components, ['country']);
        }
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
      accessibilityRole="button"
      className="flex-row items-center px-4 py-3 border-b border-gray-200 active:bg-gray-50"
    >
      <Feather name="map-pin" size={14} color="#64748b" accessible={false} />
      <Text className="text-sm text-gray-700 flex-1 ml-2" numberOfLines={1}>
        {item.description}
      </Text>
    </Pressable>
  );

  const mapHtml = useMemo(
    () => generateGoogleMapHTML(initialLat, initialLng, apiKey),
    [initialLat, initialLng, apiKey],
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
                <Feather name="search" size={16} color="#64748b" />
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
        <View className="flex-1" importantForAccessibility="no">
          <SharedWebViewMap
            ref={webViewRef}
            html={mapHtml}
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
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            accessible={false}
          />
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
});

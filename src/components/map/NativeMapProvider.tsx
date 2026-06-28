import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { MapProviderProps } from './types';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function generateMapHTML(lat: number, lng: number) {
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

  var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

  function sendMessage(type, data) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
  }

  marker.on('dragend', function(e) {
    var pos = marker.getLatLng();
    sendMessage('coordinateChanged', { latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) });
  });

  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    sendMessage('coordinateChanged', { latitude: e.latlng.lat.toFixed(6), longitude: e.latlng.lng.toFixed(6) });
  });

  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setMarker') {
        var ll = L.latLng(parseFloat(msg.lat), parseFloat(msg.lng));
        marker.setLatLng(ll);
        map.setView(ll, map.getZoom());
      }
    } catch(err) {}
  });

  document.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
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

export default function NativeMapProvider({
  initialLat = 27.700769,
  initialLng = 85.30014,
  initialAddress = '',
  onSelectLocation,
  onCancel,
}: MapProviderProps) {
  const { t } = useTranslation();
  const [coordinate, setCoordinate] = useState({ latitude: initialLat, longitude: initialLng });
  const [addressText, setAddressText] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      );
      if (response.ok) {
        const data = await response.json();
        setAddressText(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  useEffect(() => {
    if (!initialAddress) {
      const fetchInitial = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${initialLat}&lon=${initialLng}&zoom=16&addressdetails=1`,
          );
          if (response.ok) {
            const data = await response.json();
            setAddressText(data.display_name || `${initialLat.toFixed(6)}, ${initialLng.toFixed(6)}`);
          }
        } catch (err) {
          console.warn('Reverse geocode failed:', err);
        }
      };
      fetchInitial();
    }
  }, [initialAddress, initialLat, initialLng]);

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
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=np&limit=5&addressdetails=1`,
        );
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results);
        }
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery('');
    setSearchResults([]);
    setCoordinate({ latitude: lat, longitude: lng });
    setAddressText(result.display_name);
    reverseGeocode(lat, lng);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'setMarker', lat: lat.toString(), lng: lng.toString() }));
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'coordinateChanged') {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        setCoordinate({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng);
      }
    } catch (err) {
      console.warn('WebView message parse failed:', err);
    }
  };

  const handleConfirm = async () => {
    let finalCity = '';
    let finalState = t('common.na');
    let finalCountry = t('home.nepal');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}&zoom=16&addressdetails=1`,
      );
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        finalCity = addr.city || addr.town || addr.village || t('common.na');
        finalState = addr.state || t('common.na');
        finalCountry = addr.country || t('home.nepal');
      }
    } catch (err) {
      console.warn('Reverse geocode on confirm failed:', err);
      finalCity = t('common.na');
    }

    await onSelectLocation({
      address: addressText || searchQuery || `${t('common.na')}, ${t('home.nepal')}`,
      lat: coordinate.latitude,
      lng: coordinate.longitude,
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
        {item.display_name}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3 z-10">
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
          source={{ html: generateMapHTML(coordinate.latitude, coordinate.longitude) }}
          style={styles.map}
          onMessage={handleMessage}
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

      <View className="flex-row px-4 py-4 bg-white border-t border-gray-200 gap-3">
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
    elevation: 5,
    zIndex: 1001,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { MapProviderProps } from './types';

interface MarkerDragEvent {
  nativeEvent: { coordinate: LatLng };
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
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

  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 300);
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

  const reverseGeocode = async (lat: number, lng: number) => {
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
  };

  useEffect(() => {
    if (!initialAddress) {
      const fetchAddress = async () => {
        setIsReverseGeocoding(true);
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
        } finally {
          setIsReverseGeocoding(false);
        }
      };
      fetchAddress();
    }
  }, [initialAddress, initialLat, initialLng]);

  const handleMarkerDragEnd = (event: MarkerDragEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoordinate({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoordinate({ latitude, longitude });
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 300);
    reverseGeocode(latitude, longitude);
  };

  const initialRegion: Region = {
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          <Marker coordinate={coordinate} draggable onDragEnd={handleMarkerDragEnd} />
        </MapView>

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

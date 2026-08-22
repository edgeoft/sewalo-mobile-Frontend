import React, { useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import { THEME_COLORS } from '@/constants/colors';

import { SharedWebViewMap } from './SharedWebViewMap';
import { useMapLocationSelector, type MapGeocoderAdapter, fallbackAddress } from './useMapLocationSelector';
import type { MapProviderProps, SearchResult } from './types';

export interface LocationSelectorProps extends MapProviderProps {
  /** Builds the provider-specific editable-map HTML. */
  generateHtml: (lat: number, lng: number) => string;
  geocoder: MapGeocoderAdapter;
}

/**
 * Shared UI shell for location pickers (Google / OSM): search bar with
 * autocomplete dropdown, address readout, draggable-marker WebView and
 * cancel/confirm footer. Provider twins only supply HTML + geocoder.
 */
export default function LocationSelector({
  initialLat,
  initialLng,
  coordinates,
  initialAddress,
  onSelectLocation,
  onCancel,
  generateHtml,
  geocoder,
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const selector = useMapLocationSelector(
    { initialLat, initialLng, coordinates, initialAddress, onSelectLocation },
    geocoder,
    webViewRef,
  );

  const mapHtml = useMemo(
    () => generateHtml(initialLat ?? 27.700769, initialLng ?? 85.30014),
    [generateHtml, initialLat, initialLng],
  );

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      onPress={() => selector.handleSelectResult(item)}
      accessibilityRole="button"
      className="flex-row items-center px-4 py-3 border-b border-gray-200 active:bg-gray-50"
    >
      <Feather name="map-pin" size={14} color="#64748b" accessible={false} />
      <Text className="text-sm text-gray-700 flex-1 ml-2" numberOfLines={1}>
        {item.description}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View
        className="bg-white border-b border-gray-200 px-4 pb-2.5 z-10"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <View className="relative">
          <SearchBar
            placeholder={t('components.searchAddress')}
            value={selector.searchQuery}
            onChangeText={selector.handleSearchChange}
            onClear={selector.handleClearSearch}
            rightIcon={
              selector.isSearching ? <ActivityIndicator size="small" color={THEME_COLORS.primary} /> : undefined
            }
            iconPosition="left"
            className="mb-0"
          />
        </View>

        <Text className="text-xs text-gray-500 mt-1 leading-4">
          {selector.isReverseGeocoding ? (
            <Text className="text-primary">{t('components.resolvingLocation')}</Text>
          ) : (
            t('components.selectedLocation', {
              address: selector.addressText || t('components.dragMarker'),
            })
          )}
        </Text>
      </View>

      <View className="flex-1 relative">
        <View className="flex-1" importantForAccessibility="no">
          <SharedWebViewMap
            ref={webViewRef}
            html={mapHtml}
            onMessage={selector.handleMessage}
            onLoadEnd={() => {
              webViewRef.current?.postMessage(
                JSON.stringify({
                  type: 'setMarker',
                  lat: selector.coordinate.latitude.toString(),
                  lng: selector.coordinate.longitude.toString(),
                }),
              );
            }}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            accessible={false}
          />
        </View>

        {selector.searchResults.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={selector.searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.place_id ?? `${item.lat},${item.lon}`}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <View
        className="flex-row px-4 bg-white border-t border-gray-200 gap-3"
        style={{ paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12) }}
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
          onPress={selector.handleConfirm}
          disabled={selector.isReverseGeocoding}
          loading={selector.isReverseGeocoding}
          className="flex-1"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

export { fallbackAddress };

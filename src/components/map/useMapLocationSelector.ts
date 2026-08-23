import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useTranslation } from 'react-i18next';

import type { SearchResult } from './types';

/** Provider-specific geocoding behaviour injected into useMapLocationSelector. */
export interface MapGeocoderAdapter {
  /** Resolve coordinates to a display address (or null when unresolved). */
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
  /** Resolve a saved address back to coordinates (or null when unresolved). */
  forwardGeocode: (address: string) => Promise<{ lat: number; lng: number } | null>;
  /** Autocomplete a partial query into search results. */
  autocomplete: (query: string) => Promise<SearchResult[]>;
  /** Optional detail-resolution for a picked search result (e.g. Google place details). */
  resolveSelection?: (result: SearchResult) => Promise<{ lat: number; lng: number; address: string } | null>;
  /** Extract administrative areas at confirm time. */
  resolveCityStateCountry: (lat: number, lng: number) => Promise<{ city: string; state: string; country: string }>;
}

export const fallbackAddress = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

/**
 * Shared state machine behind the Google/OSM location selectors.
 * Owns coordinate/address/search state, WebView messaging, debounce lifecycle
 * (with unmount cleanup) and the confirm flow.
 */
interface MapLocationSelectorOptions {
  initialLat?: number;
  initialLng?: number;
  coordinates?: { lat: number; lng: number } | null;
  initialAddress?: string;
  onSelectLocation: (data: {
    address: string;
    lat: number;
    lng: number;
    coordinates?: { lat: number; lng: number };
    city?: string;
    state?: string;
    country?: string;
  }) => Promise<void> | void;
}

export function useMapLocationSelector(
  options: MapLocationSelectorOptions,
  geocoder: MapGeocoderAdapter,
  webViewRef: RefObject<WebView | null>,
) {
  const { initialLat = 27.700769, initialLng = 85.30014, coordinates, initialAddress = '', onSelectLocation } = options;
  const { t } = useTranslation();

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

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const postMarker = useCallback(
    (lat: number, lng: number) => {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'setMarker', lat: lat.toString(), lng: lng.toString() }));
    },
    [webViewRef],
  );

  // Reverse Geocoding Implementation
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseGeocoding(true);
      let resolvedAddress: string | null = null;
      try {
        resolvedAddress = await geocoder.reverseGeocode(lat, lng);
      } catch (err) {
        console.warn('Reverse geocode failed:', err);
      }
      if (!mountedRef.current) return;
      setAddressText(resolvedAddress || fallbackAddress(lat, lng));
      setIsReverseGeocoding(false);
    },
    [geocoder],
  );

  // Initial geocoding on mount
  useEffect(() => {
    if (initialAddress) return;
    let cancelled = false;
    const fetchInitial = async () => {
      setIsReverseGeocoding(true);
      let resolved: string | null = null;
      try {
        resolved = await geocoder.reverseGeocode(initialLat, initialLng);
      } catch (err) {
        console.warn('Initial reverse geocode failed:', err);
      }
      if (cancelled || !mountedRef.current) return;
      setAddressText(resolved || fallbackAddress(initialLat, initialLng));
      setIsReverseGeocoding(false);
    };
    fetchInitial();
    return () => {
      cancelled = true;
    };
  }, [initialAddress, initialLat, initialLng, geocoder]);

  // Sync WebView marker location when parent coordinates change (e.g. during edits)
  useEffect(() => {
    postMarker(startLat, startLng);
  }, [startLat, startLng, postMarker]);

  // Forward geocode initialAddress on mount to position marker on the saved address
  useEffect(() => {
    if (!initialAddress) return;
    let cancelled = false;
    const geocodeInitial = async () => {
      try {
        const loc = await geocoder.forwardGeocode(initialAddress);
        if (!loc || cancelled || !mountedRef.current) return;
        setCoordinate({ latitude: loc.lat, longitude: loc.lng });
        postMarker(loc.lat, loc.lng);
      } catch (err) {
        console.warn('Geocoding initial address failed:', err);
      }
    };
    geocodeInitial();
    return () => {
      cancelled = true;
    };
  }, [initialAddress, geocoder, postMarker]);

  // Search Address autocomplete
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (text.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await geocoder.autocomplete(text.trim());
          if (!mountedRef.current) return;
          setSearchResults(results);
        } catch (err) {
          console.warn('Search query failed:', err);
        } finally {
          if (mountedRef.current) setIsSearching(false);
        }
      }, 450);
    },
    [geocoder],
  );

  // Select Address search result
  const handleSelectResult = useCallback(
    async (result: SearchResult) => {
      setIsSearching(true);
      try {
        let picked: { lat: number; lng: number; address: string } | null = null;
        if (geocoder.resolveSelection) {
          picked = await geocoder.resolveSelection(result);
        } else if (result.lat && result.lon) {
          picked = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name || result.description,
          };
        }
        if (!picked || !mountedRef.current) return;

        setSearchQuery('');
        setSearchResults([]);
        setCoordinate({ latitude: picked.lat, longitude: picked.lng });
        setAddressText(picked.address);
        postMarker(picked.lat, picked.lng);
      } catch (err) {
        console.warn('Place details fetch failed:', err);
      } finally {
        if (mountedRef.current) setIsSearching(false);
      }
    },
    [geocoder, postMarker],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
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
    },
    [reverseGeocode],
  );

  const cleanStr = (val: string, fallback: string) => {
    if (!val || val.trim() === '' || val.toLowerCase() === 'n/a' || val === t('common.na')) {
      return fallback;
    }
    return val;
  };

  // Confirm Location selection
  const handleConfirm = useCallback(async () => {
    let finalCity = '';
    let finalState = '';
    let finalCountry = '';

    try {
      const parts = await geocoder.resolveCityStateCountry(coordinate.latitude, coordinate.longitude);
      finalCity = cleanStr(parts.city, '');
      finalState = cleanStr(parts.state, '');
      finalCountry = cleanStr(parts.country, '');
    } catch (err) {
      console.warn('Reverse geocode on confirm failed:', err);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanStr depends only on t
  }, [geocoder, coordinate.latitude, coordinate.longitude, addressText, searchQuery, onSelectLocation, t]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    coordinate,
    addressText,
    searchQuery,
    searchResults,
    isSearching,
    isReverseGeocoding,
    handleSearchChange,
    handleClearSearch,
    handleSelectResult,
    handleMessage,
    handleConfirm,
  };
}

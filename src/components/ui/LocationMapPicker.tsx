'use dom';

import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
}

interface Props {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  provider?: 'osm' | 'google';
  googleApiKey?: string;
  onSelectLocation: (data: LocationData) => Promise<void>;
  onCancel: () => Promise<void>;
  dom?: import('expo/dom').DOMProps;
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  searchContainer: {
    position: 'relative' as const,
    padding: '16px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    zIndex: 1000,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '12px 40px 12px 16px',
    fontSize: '15px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s',
  },
  searchIcon: {
    position: 'absolute' as const,
    right: '28px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none' as const,
  },
  resultsDropdown: {
    position: 'absolute' as const,
    top: '68px',
    left: '16px',
    right: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    maxHeight: '220px',
    overflowY: 'auto' as const,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 1001,
  },
  resultItem: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#334155',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  map: {
    flex: 1,
    width: '100%',
    zIndex: 1,
  },
  footer: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '12px',
    zIndex: 1000,
    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  button: {
    flex: 1,
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'opacity 0.2s',
  },
  primaryButton: {
    backgroundColor: '#485aff',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  selectedAddressText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
    lineHeight: '1.4',
    wordBreak: 'break-word' as const,
  },
  loadingContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid #f1f5f9',
    borderTopColor: '#485aff',
    animation: 'spin 1s linear infinite',
  },
};

export default function LocationMapPicker({
  initialLat = 27.700769,
  initialLng = 85.30014,
  initialAddress = '',
  provider = 'osm',
  googleApiKey,
  onSelectLocation,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [isMapLibraryLoaded, setIsMapLibraryLoaded] = useState(false);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [addressText, setAddressText] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const handleCancel = () => {
    onCancel();
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Dynamic injection of mapping styles/scripts
  useEffect(() => {
    if (provider === 'osm') {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setIsMapLibraryLoaded(true);
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(link);
        document.head.removeChild(script);
      };
    } else {
      // Google Maps JS API loader
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey || ''}&libraries=places`;
      script.onload = () => {
        setIsMapLibraryLoaded(true);
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [provider, googleApiKey]);

  // Leaflet map initialization logic
  useEffect(() => {
    if (!isMapLibraryLoaded || provider !== 'osm' || !mapContainerRef.current || leafletMapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Fix marker icon default paths in Leaflet
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: defaultIcon,
    }).addTo(map);

    // Marker drag handlers
    marker.on('dragend', async () => {
      const position = marker.getLatLng();
      const newLat = position.lat;
      const newLng = position.lng;
      setLat(newLat);
      setLng(newLng);
      map.panTo(position);

      setIsReverseGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=16&addressdetails=1`,
        );
        if (response.ok) {
          const result = await response.json();
          setAddressText(result.display_name || `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
        }
      } catch (err) {
        console.warn('Reverse geocode failed:', err);
      } finally {
        setIsReverseGeocoding(false);
      }
    });

    leafletMapRef.current = map;
    leafletMarkerRef.current = marker;

    // If initialAddress was not provided, reverse geocode coordinates on mount
    if (!initialAddress) {
      marker.fire('dragend');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLibraryLoaded, provider]);

  // Google Maps initialization logic
  useEffect(() => {
    if (!isMapLibraryLoaded || provider !== 'google' || !mapContainerRef.current) return;

    const google = (window as any).google;
    if (!google) return;

    const center = { lat, lng };
    const map = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
    });

    const marker = new google.maps.Marker({
      position: center,
      map,
      draggable: true,
    });

    // Geocoder
    const geocoder = new google.maps.Geocoder();

    const handleGoogleMarkerPosition = (position: any) => {
      const newLat = position.lat();
      const newLng = position.lng();
      setLat(newLat);
      setLng(newLng);
      map.panTo(position);

      setIsReverseGeocoding(true);
      geocoder.geocode({ location: position }, (results: any, status: any) => {
        setIsReverseGeocoding(false);
        if (status === 'OK' && results[0]) {
          setAddressText(results[0].formatted_address);
        } else {
          setAddressText(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
        }
      });
    };

    marker.addListener('dragend', () => {
      handleGoogleMarkerPosition(marker.getPosition());
    });

    if (!initialAddress) {
      handleGoogleMarkerPosition(marker.getPosition());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLibraryLoaded, provider]);

  // Search input typing debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (provider === 'osm') {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              value,
            )}&countrycodes=np&limit=5&addressdetails=1`,
          );
          if (response.ok) {
            const results = await response.json();
            setSearchResults(results);
          }
        } else {
          // Google Places Autocomplete implementation placeholder
          const google = (window as any).google;
          if (google) {
            const service = new google.maps.places.AutocompleteService();
            service.getPlacePredictions(
              { input: value, componentRestrictions: { country: 'np' } },
              (predictions: any) => {
                if (predictions) {
                  setSearchResults(
                    predictions.map((p: any) => ({
                      display_name: p.description,
                      place_id: p.place_id,
                    })),
                  );
                }
              },
            );
          }
        }
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  // Select location from search dropdown list
  const handleSelectResult = async (result: any) => {
    setSearchResults([]);
    setSearchQuery('');
    setIsReverseGeocoding(true);

    let targetLat = lat;
    let targetLng = lng;
    let displayName = result.display_name;

    try {
      if (provider === 'osm') {
        targetLat = parseFloat(result.lat);
        targetLng = parseFloat(result.lon);
        setLat(targetLat);
        setLng(targetLng);
        setAddressText(displayName);

        if (leafletMapRef.current && leafletMarkerRef.current) {
          const newPos = new (window as any).L.LatLng(targetLat, targetLng);
          leafletMarkerRef.current.setLatLng(newPos);
          leafletMapRef.current.setView(newPos, 16);
        }
      } else {
        const google = (window as any).google;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ placeId: result.place_id }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            targetLat = loc.lat();
            targetLng = loc.lng();
            setLat(targetLat);
            setLng(targetLng);
            setAddressText(results[0].formatted_address);
          }
        });
      }
    } catch (err) {
      console.warn('Selection placement failed:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Submit selected location
  const handleConfirm = async () => {
    let finalCity = '';
    let finalState = t('common.na');
    let finalCountry = t('home.nepal');

    // Extract address details dynamically from OSM Nominatim API if available
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      );
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        finalCity = addr.city || addr.town || addr.village || t('common.na');
        finalState = addr.state || t('common.na');
        finalCountry = addr.country || t('home.nepal');
      }
    } catch {
      // Fallback defaults
      finalCity = t('common.na');
    }

    await onSelectLocation({
      address: addressText || searchQuery || `${t('common.na')}, ${t('home.nepal')}`,
      lat,
      lng,
      city: finalCity,
      state: finalState,
      country: finalCountry,
    });
  };

  return (
    <div style={styles.container}>
      {/* Dynamic spinner logic injected directly inside HTML head */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        html, body { height: 100%; margin: 0; padding: 0; }
        #root { height: 100%; }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
        }}
      />

      {/* Header Search Field */}
      <div style={styles.searchContainer}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={t('components.searchAddress')}
            value={searchQuery}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          {isSearching ? (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #cbd5e1',
                borderTopColor: '#485aff',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <span style={styles.searchIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          )}
        </div>

        {/* Selected Address Display */}
        <div style={styles.selectedAddressText}>
          {isReverseGeocoding ? (
            <span style={{ color: '#485aff' }}>{t('components.resolvingLocation')}</span>
          ) : (
            t('components.selectedLocation', { address: addressText || t('components.dragMarker') })
          )}
        </div>

        {/* Results Autocomplete list */}
        {searchResults.length > 0 && (
          <div style={styles.resultsDropdown}>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectResult(result)}
                style={styles.resultItem}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {result.display_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map view */}
      {!isMapLibraryLoaded ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>{t('components.initializingMap')}</div>
        </div>
      ) : (
        <div ref={mapContainerRef} style={styles.map} />
      )}

      {/* Bottom Action Footer */}
      <div style={styles.footer}>
        <button onClick={handleCancel} style={{ ...styles.button, ...styles.secondaryButton }}>
          {t('common.cancel')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isMapLibraryLoaded || isReverseGeocoding}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            opacity: !isMapLibraryLoaded || isReverseGeocoding ? 0.6 : 1,
            cursor: !isMapLibraryLoaded || isReverseGeocoding ? 'not-allowed' : 'pointer',
          }}
        >
          {t('components.confirmLocation')}
        </button>
      </div>
    </div>
  );
}

import type { LocationData, MapViewport, NearbyProvider } from '@/types';

export interface MapLocationData extends LocationData {
  coordinates?: { lat: number; lng: number } | null;
}

export interface MapMarkerPayload {
  id: string;
  name: string;
  avatar: string;
  rating: string;
  lat: number;
  lng: number;
}

export interface NearbyServicesMapProps {
  userLat: number;
  userLng: number;
  providers: NearbyProvider[];
  selectedProviderId: string | null;
  onSelectProvider: (providerId: string | null) => void;
  onMapCenterChange?: (lat: number, lng: number) => void;
  onMapViewportChange?: (viewport: MapViewport) => void;
}

export interface MapProviderProps {
  initialLat?: number;
  initialLng?: number;
  coordinates?: { lat: number; lng: number } | null;
  initialAddress?: string;
  onSelectLocation: (data: MapLocationData) => Promise<void>;
  onCancel: () => Promise<void>;
}

export interface SearchResult {
  description: string;
  place_id?: string;
  display_name?: string;
  lat?: string;
  lon?: string;
}

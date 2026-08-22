import type { LocationData } from '@/types';

export interface MapLocationData extends LocationData {
  coordinates?: { lat: number; lng: number } | null;
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

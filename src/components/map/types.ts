export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  coordinates?: { lat: number; lng: number } | null;
  city?: string;
  state?: string;
  country?: string;
}

export interface MapProviderProps {
  initialLat?: number;
  initialLng?: number;
  coordinates?: { lat: number; lng: number } | null;
  initialAddress?: string;
  onSelectLocation: (data: LocationData) => Promise<void>;
  onCancel: () => Promise<void>;
}

export interface SearchResult {
  description: string;
  place_id?: string;
  display_name?: string;
  lat?: string;
  lon?: string;
}

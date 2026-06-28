export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface MapProviderProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSelectLocation: (data: LocationData) => Promise<void>;
  onCancel: () => Promise<void>;
}

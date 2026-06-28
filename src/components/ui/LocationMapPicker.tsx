import NativeMapProvider from '../map/NativeMapProvider';
import type { LocationData } from '../map/types';

export type { LocationData };

interface Props {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSelectLocation: (data: LocationData) => Promise<void>;
  onCancel: () => Promise<void>;
}

export default function LocationMapPicker(props: Props) {
  return <NativeMapProvider {...props} />;
}

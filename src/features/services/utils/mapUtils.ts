/**
 * Generates deterministic coordinates offset from a center coordinate based on a seed string (e.g. provider ID).
 * This ensures markers stay in the same position on subsequent renders and are relative to the user center.
 *
 * 1 degree latitude = ~111.11 km
 * 1 degree longitude = ~111.11 km * cos(latitude)
 */
export function getMockCoordinates(seed: string, centerLat: number, centerLng: number, radiusKm: number = 2) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use hash to generate deterministic offsets between -0.5 and 0.5
  const random1 = (Math.abs(Math.sin(hash)) % 1) - 0.5;
  const random2 = (Math.abs(Math.cos(hash)) % 1) - 0.5;

  // Convert km radius to degree offsets
  const latOffset = (random1 * radiusKm) / 111.11;
  const lngOffset = (random2 * radiusKm) / (111.11 * Math.cos((centerLat * Math.PI) / 180));

  return {
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
  };
}

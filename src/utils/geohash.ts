/**
 * Geohash & Viewport Quantization Utilities for React Native Mobile App
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(lat: number, lng: number, precision: number = 6): string {
  let minLat = -90.0;
  let maxLat = 90.0;
  let minLng = -180.0;
  let maxLng = 180.0;

  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        minLng = mid;
      } else {
        maxLng = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        minLat = mid;
      } else {
        maxLat = mid;
      }
    }

    isEven = !isEven;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

export function addBoundingBoxBuffer(
  sw: { lat: number; lng: number },
  ne: { lat: number; lng: number },
  bufferRatio: number = 0.2,
) {
  const latSpan = Math.abs(ne.lat - sw.lat);
  const lngSpan = Math.abs(ne.lng - sw.lng);

  const latBuffer = latSpan * bufferRatio;
  const lngBuffer = lngSpan * bufferRatio;

  return {
    sw: {
      lat: Math.max(-90, sw.lat - latBuffer),
      lng: Math.max(-180, sw.lng - lngBuffer),
    },
    ne: {
      lat: Math.min(90, ne.lat + latBuffer),
      lng: Math.min(180, ne.lng + lngBuffer),
    },
  };
}

export function quantizeCoord(coord: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(coord * factor) / factor;
}

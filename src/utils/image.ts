import { Image } from 'react-native';

import { ENV } from '@/constants/env';

const FALLBACK_IMAGE_URI = Image.resolveAssetSource(require('@/assets/images/fall_back.jpg')).uri;
const FALLBACK_AVATAR_URI = Image.resolveAssetSource(require('@/assets/images/avatar-default.png')).uri;

export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${ENV.S3_BASE_URL}${cleanPath}`;
}

export function getAvatarUrl(url: string | null | undefined): string {
  return getImageUrl(url) || FALLBACK_AVATAR_URI;
}

export function getImageSource(url: string | null | undefined): string {
  return getImageUrl(url) || FALLBACK_IMAGE_URI;
}

export const FALLBACKS = {
  image: FALLBACK_IMAGE_URI as string,
  avatar: FALLBACK_AVATAR_URI as string,
} as const;

export function getSource(url: string | null | undefined, type: 'image' | 'avatar' = 'image'): { uri: string } {
  const resolved = type === 'avatar' ? getAvatarUrl(url) : getImageSource(url);
  return { uri: resolved };
}

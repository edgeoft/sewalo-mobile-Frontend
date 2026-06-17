import { ENV } from '@/constants/env';

/**
 * Resolves the absolute URL of an image path returned from the backend.
 * Handles:
 * 1. Absolute URLs / Signed URLs (starts with http/https) -> returns as is.
 * 2. Relative S3 paths -> prepends the S3 base URL.
 */
export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // 1. If it's already an absolute URL (like a signed S3 URL or external avatar), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 2. Otherwise, resolve against the S3 base URL
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${ENV.S3_BASE_URL}${cleanPath}`;
}

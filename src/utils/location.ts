export interface ProviderLocationSource {
  city?: string | null;
  address?: string | null;
}

/**
 * Formats a provider's location as "Address, City" with graceful fallbacks.
 */
export function formatProviderLocation(source: ProviderLocationSource | null | undefined, fallback = 'Nepal'): string {
  const city = source?.city;
  const address = source?.address;
  if (city && address) return `${address}, ${city}`;
  return city || address || fallback;
}

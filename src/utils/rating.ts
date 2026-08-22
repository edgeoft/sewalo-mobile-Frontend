/**
 * Resolves a provider/service rating from the API's dual representation
 * (string `average_rating` and numeric `avg_rating`) into a single number.
 *
 * Precedence: service-level string → provider string → provider numeric → fallback.
 */
export function getProviderRating(
  sources: ({ average_rating?: string | null; avg_rating?: number | null } | null | undefined)[],
  fallback = 0,
): number {
  for (const source of sources) {
    if (!source) continue;
    if (source.average_rating != null && source.average_rating !== '') {
      const parsed = parseFloat(source.average_rating);
      if (!isNaN(parsed)) return parsed;
    }
    if (source.avg_rating != null) return source.avg_rating;
  }
  return fallback;
}

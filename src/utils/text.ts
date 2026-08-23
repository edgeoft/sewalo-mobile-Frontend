/**
 * Calculates estimated read time for a text block.
 */
export function getReadTime(description: string | null | undefined): string {
  if (!description) return '3 min read';
  const clean = cleanDescriptionText(description);
  const words = clean.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 150);
  return `${Math.max(minutes, 1)} min read`;
}

/**
 * Strips HTML tags and collapses whitespace.
 */
export function cleanDescriptionText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Normalizes an API list field that may arrive as an array or as a CSV string
 * (e.g. "a, b" / ["a","b"]) into a clean string array.
 */
export function toStringArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

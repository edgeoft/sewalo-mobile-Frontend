const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a time string or Date into HH:MM format (24 hour) without timezone shifting.
 * Supports ISO datetime strings (e.g., 2026-08-20T09:00:00.000000Z), SQL datetime strings,
 * 12-hour strings (09:00 AM), and 24-hour time strings (09:00:00, 09:00).
 */
export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  const trimmed = timeString.trim();

  // 1. Check for ISO datetime string containing 'T' (e.g. "2026-08-20T09:00:00.000000Z")
  const isoMatch = trimmed.match(/T(\d{1,2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1].padStart(2, '0')}:${isoMatch[2]}`;
  }

  // 2. Check for SQL datetime string containing space (e.g. "2026-08-20 14:30:00" or "2026-08-20 02:30 PM")
  const spaceMatch = trimmed.match(/\s+(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?/i);
  if (spaceMatch) {
    let hours = parseInt(spaceMatch[1], 10);
    const minutes = spaceMatch[2];
    const period = spaceMatch[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // 3. Check for 12-hour AM/PM format (e.g. "02:30 PM" or "2:30pm")
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // 4. Check for standard 24-hour time format (e.g. "14:30", "14:30:00", "09:00", "9:00")
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    return `${match24[1].padStart(2, '0')}:${match24[2]}`;
  }

  return trimmed;
};

/**
 * Formats a 24-hour or ISO time string into a 12-hour format with AM/PM (hh:mm AM/PM).
 */
export const parseTime12h = (time24: string | null | undefined): string | null => {
  if (!time24) return null;
  const formatted = formatTime(time24);
  if (!formatted) return null;
  const parts = formatted.split(':');
  if (parts.length < 2) return formatted;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

/**
 * Converts a 12-hour AM/PM time string (hh:mm AM/PM) into a 24-hour database-friendly format (HH:MM:00).
 */
export const convertTimeTo24h = (time12: string): string => {
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    const formatted = formatTime(time12);
    if (formatted) return `${formatted}:00`;
    return '09:00:00';
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
};

/**
 * Formats a date string (YYYY-MM-DD or ISO timestamp) into 'MMM DD, YYYY' format without timezone shifting.
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  // Match YYYY-MM-DD from start or within ISO string (e.g. "2026-08-20" or "2026-08-20T00:00:00.000000Z")
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);

    if (monthIndex >= 0 && monthIndex < 12) {
      return `${MONTHS_SHORT[monthIndex]} ${String(day).padStart(2, '0')}, ${year}`;
    }
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime())
    ? trimmed
    : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

/**
 * Formats a 24-hour time string (HH:MM:SS) into a 12-hour format with AM/PM (hh:mm AM/PM).
 */
export const parseTime12h = (time24: string | null | undefined): string | null => {
  if (!time24) return null;
  const parts = time24.split(':');
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
  if (!match) return '09:00:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
};

/**
 * Formats an ISO or raw date string to "MMM DD, YYYY" (e.g. Jun 02, 2026)
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Formats a time string or Date into HH:MM format (24 hour)
 */
export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
};

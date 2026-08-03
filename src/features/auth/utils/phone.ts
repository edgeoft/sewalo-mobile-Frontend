// Normalizes Nepalese phone number formats to include the +977 country code prefix
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.startsWith('977')) {
    return `+${cleaned}`;
  }
  return `+977${cleaned}`;
};

// Extracts the 10-digit national mobile number without country code
export const unformatPhone = (phone?: string | null): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('977') && cleaned.length >= 13) {
    return cleaned.slice(3);
  }
  return cleaned;
};

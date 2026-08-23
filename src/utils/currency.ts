/**
 * Single source of truth for currency display.
 * All NPR amounts render through here — never inline `Rs.` templates.
 */
export function formatNpr(amount: number | string | null | undefined): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `Rs. ${value.toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

interface PricedOffering {
  price: string;
}

/** Lowest priced offering of a service, formatted for display. */
export function getStartingPrice(serviceOfferings?: PricedOffering[] | null): string {
  if (!serviceOfferings || serviceOfferings.length === 0) return 'N/A';
  const prices = serviceOfferings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
  if (prices.length === 0) return 'N/A';
  return formatNpr(Math.min(...prices));
}

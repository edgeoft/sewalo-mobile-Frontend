export const NEPAL_BANKS = [
  'Nepal Bank Limited',
  'Rastriya Banijya Bank',
  'Agriculture Development Bank',
  'Nabil Bank Limited',
  'Nepal Investment Mega Bank',
  'Standard Chartered Bank Nepal',
  'Himalayan Bank Limited',
  'Nepal SBI Bank',
  'Everest Bank',
  'Prabhu Bank',
  'Global IME Bank',
  'Citizens Bank International',
  'Prime Commercial Bank',
  'Sunrise Bank',
  'NMB Bank',
  'NIC Asia Bank',
  'Siddhartha Bank',
  'Sanima Bank',
  'Machhapuchchhre Bank',
  'Kumari Bank',
] as const;

export const DIGITAL_WALLETS = ['eSewa', 'Khalti'] as const;

export type NepalBank = (typeof NEPAL_BANKS)[number];
export type DigitalWallet = (typeof DIGITAL_WALLETS)[number];

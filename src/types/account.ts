import { Feather } from '@expo/vector-icons';
import type { Href } from 'expo-router';

export type AccountMenuItemId =
  | 'edit-profile'
  | 'switch-role'
  | 'my-reviews'
  | 'identity-verification'
  | 'refer-friend'
  | 'language'
  | 'notification-settings'
  | 'privacy-settings'
  | 'change-password'
  | 'help-faq'
  | 'contact-support'
  | 'terms-of-service'
  | 'privacy-policy'
  | 'rate-app'
  | 'logout'
  | 'payout-accounts'
  | 'verification-documents';

export interface AccountMenuItemOption {
  id: AccountMenuItemId;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  route?: Href | string;
  destructive?: boolean;
}

export interface AccountMenuSection {
  id: string;
  title: string;
  items: AccountMenuItemOption[];
}

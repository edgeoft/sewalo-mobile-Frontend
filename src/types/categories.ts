import type { DataEnvelope } from './common';

export interface BillingOption {
  id: string;
  name: string;
  label: string;
  is_active: boolean;
  is_default?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  img?: string | null;
  icon?: string | null;
  show_on_homepage?: boolean;
  billing_options?: BillingOption[];
}

export type CategoryResponse = DataEnvelope<Category[]>;

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

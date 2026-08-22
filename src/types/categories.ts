import type { DataEnvelope } from './common';

export interface Category {
  id: string;
  name: string;
  slug: string;
  img?: string | null;
  icon?: string | null;
  show_on_homepage?: boolean;
}

export type CategoryResponse = DataEnvelope<Category[]>;

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

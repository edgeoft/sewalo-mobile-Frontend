import { SubCategory } from './category';

export interface ServiceOffering {
  id: string;
  service_id: string;
  sub_category_id: string;
  price: string;
  duration: number;
  duration_unit: string;
  sub_category: SubCategory;
}

export interface ServicePackage {
  id: string;
  service_id: string;
  name: string;
  services_offered: string[];
  price: string;
  duration: number;
  duration_unit: string;
  description: string | null;
  is_active: boolean;
}

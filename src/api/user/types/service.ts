import { Category, SubCategory } from './category';
import { UserProfile } from '@/features/auth/api/types';

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

export interface Service {
  id: string;
  name: string;
  description: string;
  category_id: string;
  provider_id: string;
  category: Category;
  provider: UserProfile;
  currency: string;
  average_rating: string;
  total_ratings: number;
  portfolio: string[];
  portfolio_url: string;
  service_location: string[];
  tags: string[];
  has_service_packages: boolean;
  service_offerings: ServiceOffering[];
  service_packages: ServicePackage[];
  is_favourite?: boolean;
}

export interface GetServiceListParams {
  page?: number;
  limit?: number;
  all?: string;
  category?: string; // Filter services by category slug
  sub_category?: string; // Filter services by sub-category slug
  min_rating?: number;
  max_rating?: number;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  languages?: string;
  service_location?: string;
  provider_status?: string;
  provider_available?: boolean;
  search?: string;
}

export interface GetServiceListResponse {
  current_page: number;
  data: Service[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
